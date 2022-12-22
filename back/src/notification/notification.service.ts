import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelInviteDto } from 'src/chat/gateway/dto/channel-invite.dto';
import { Channel, Conversation, Notification, User } from 'src/typeorm';
import { UserService } from 'src/user/user.service';
import { ChannelService } from 'src/chat/channel/channel.service';
import { notificationType } from 'src/utils/types/types';
import { FindOneOptions, Repository } from 'typeorm';
import { ChannelNotFoundException } from 'src/utils/exceptions';
import { AuthenticatedSocket } from 'src/utils/types/auth-socket';
import { GlobalService } from 'src/utils/global/global.service';

@Injectable()
export class NotificationService {
	constructor(
		private userService: UserService,
		@Inject(forwardRef(() => ChannelService))
		private channelService: ChannelService,
		private globalService: GlobalService,

		@InjectRepository(Notification)
		private notifRepo: Repository<Notification>,
		@InjectRepository(Channel)
		private channelRepo: Repository<Channel>,
	) {}

	createFriendRequestNotif(addressee: User, requester: User) {
		const notif = this.notifRepo.create({
			addressee,
			requester,
			type: notificationType.FRIEND_REQUEST,
		});
		return this.notifRepo.save(notif);
	}

	async createChanInviteNotif(user: User, dto: ChannelInviteDto): Promise<Notification> {
		const addressee = await this.userService.findOneBy({ id: dto.userId });
		if (!addressee)
			throw new NotFoundException('User not found');
		const channel = await this.channelRepo.findOneBy({ id: dto.chanId });
		if (!channel)
			throw new ChannelNotFoundException();
		const inChannel = await this.channelService.getChannelUser(dto.chanId, dto.userId);
		if (inChannel)
			throw new BadRequestException('User is already in channel');
		const inviteAlreadySent = await this.notifRepo.findOne({
			where: {
				addressee: { id: dto.userId },
				requester: { id: user.id },
				channel: { id: dto.chanId },
				type: notificationType.CHANNEL_INVITE,
			}
		});
		if (inviteAlreadySent)
			throw new BadRequestException('Invite already sent');
		const notif = this.notifRepo.create({
			addressee,
			requester: user,
			channel,
			type: notificationType.CHANNEL_INVITE,
		});
		return this.notifRepo.save(notif);
	}

	async createPartyInviteNotif(user: User, addresseeId: number) {
		const addressee = await this.userService.findOneBy({ id: addresseeId });
		if (!addressee)
			throw new NotFoundException('User not found');
		const inviteAlreadySent = await this.notifRepo.findOne({
			where: {
				addressee: { id: addressee.id },
				requester: { id: user.id },
				type: notificationType.PARTY_INVITE,
			}
		});
		if (inviteAlreadySent)
			throw new BadRequestException('Invite already sent');
		const notif = this.notifRepo.create({
			addressee,
			requester: user,
			type: notificationType.PARTY_INVITE,
			delete_at: new Date(Date.now() + 20 * 1000)
		});
		const notifToSend = await this.notifRepo.save(notif);
		return notifToSend;
	}

	findOne(options: FindOneOptions<Notification>): Promise<Notification | null> {
		return this.notifRepo.findOne(options);
	}

	async getNotifications(user: User): Promise<Notification[]> {
		return this.notifRepo.createQueryBuilder("notif")
			.leftJoin("notif.requester", "requester")
			.addSelect(["requester.id", "requester.username", "requester.avatar"])
			.leftJoin("notif.channel", "channel")
			.addSelect(["channel.id", "channel.name"])
			.leftJoin("notif.conversation", "conv")
			.addSelect("conv.id")
			.where("notif.addresseeId = :userId", { userId: user.id })
			.getMany();
	}

	getChannelInvite(user: User, id: number) {
		return this.notifRepo.findOne({
			where: {
				addressee: { id: user.id },
				id,
			}
		});
	}

	/**
	 * Fetch all the sockets that are actually in the channel room and get the users id
	 * then fetch all the channelUsers id in this channel except those in the room.
	 * Finally, it loop the channelUsers, if they don't already have a channel notif,
	 * creates one and emit it to them
	 * @param chanId 
	 */
	async sendMessageNotif(chanId: number) {
		const socketsInRoom = await this.globalService.server.in(`channel-${chanId}`).fetchSockets() as unknown as AuthenticatedSocket[];
		const usersInRoomId: number[] = socketsInRoom.map(socket => socket.user.id);
		const usersToSendNotif = await this.channelService.getUsersInChannelExecptInArgs(chanId, usersInRoomId);

		usersToSendNotif.forEach(async user => {
			const notifExist = await this.notifRepo.findOne({
				where: {
					channel: { id: chanId },
					addressee: { id: user.id },
					type: notificationType.CHANNEL_MESSAGE
				}
			});
			if (!notifExist) {
				const notif = this.notifRepo.create({
					channel: { id: chanId },
					addressee: { id: user.id },
					type: notificationType.CHANNEL_MESSAGE
				});
				const notifToSend = await this.notifRepo.save(notif);
				this.globalService.server.to(`user-${user.id}`).emit('NewNotification', notifToSend);
			}
		})
	}

	async sendPrivateMessageNotif(senderId: number, conv: Conversation) {
		const socketsInRoom = await this.globalService.server.in(`conversation-${conv.id}`).fetchSockets() as unknown as AuthenticatedSocket[];
		const usersInRoomId: number[] = socketsInRoom.map(socket => socket.user.id);
		const userToSend = conv.user1.id === senderId ? conv.user2 : conv.user1;
		if (!usersInRoomId.find(id => id === userToSend.id)) {
			const notifExist = await this.notifRepo.findOne({
				where: {
					conversation: { id: conv.id },
					addressee: { id: userToSend.id },
					type: notificationType.PRIVATE_MESSAGE
				}
			});
			if (!notifExist) {
				const notif = this.notifRepo.create({
					conversation: { id: conv.id },
					addressee: { id: userToSend.id },
					type: notificationType.PRIVATE_MESSAGE
				});
				const notifToSend = await this.notifRepo.save(notif);
				this.globalService.server.to(`user-${userToSend.id}`).emit('NewNotification', notifToSend);
			}
		}
	}

	async deleteChannelMessageNotif(userId: number, chanId: number): Promise<number | null> {
		const notif = await this.notifRepo.createQueryBuilder("notif")
			.where('notif.addresseeId = :userId AND notif.channelId = :chanId', { userId: userId, chanId: chanId })
			.andWhere('notif.type = :chanMsg', { chanMsg: notificationType.CHANNEL_MESSAGE })
			.getOne()
		
		if (notif) {
			await this.delete(notif.id);
			this.globalService.server.to(`user-${userId}`).emit('DeleteNotification', notif.id);
			return notif.id;
		}
		return null;
	}

	async deletePrivateMessageNotif(userId: number, convId: number): Promise<number | null> {
		const notif = await this.notifRepo.createQueryBuilder("notif")
			.where('notif.addresseeId = :userId AND notif.conversationId = :convId', { userId: userId, convId: convId })
			.andWhere('notif.type = :convMsg', { convMsg: notificationType.PRIVATE_MESSAGE })
			.getOne()
		
		if (notif) {
			await this.delete(notif.id);
			return notif.id;
		}
		return null;
	}

	delete(id: number) {
		return this.notifRepo.delete(id);
	}
}
