import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelInviteDto } from 'src/chat/gateway/dto/channel-invite.dto';
import { Channel, Friendship, Notification, User } from 'src/typeorm';
import { UserService } from 'src/user/user.service';
import { ChannelService } from 'src/chat/channel/channel.service';
import { notificationType } from 'src/utils/types/types';
import { FindOneOptions, Repository } from 'typeorm';
import { ChannelNotFoundException } from 'src/utils/exceptions';
import { AuthenticatedSocket } from 'src/utils/types/auth-socket';
import { TaskService } from 'src/task-scheduling/task.service';

@Injectable()
export class NotificationService {
	constructor(
		private userService: UserService,
		@Inject(forwardRef(() => ChannelService))
		private channelService: ChannelService,

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

	async createChanInviteNotif(user: User, dto: ChannelInviteDto) {
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
		// this.taskService.handlePartyInviteNotif(notif);
		return notifToSend;
	}

	findOne(options: FindOneOptions<Notification>): Promise<Notification | null> {
		return this.notifRepo.findOne(options);
	}

	getNotification(user: User) {
		return this.notifRepo.find({
			relations: {
				requester: true,
				channel: true,
			},
			where: {
				addressee: { id: user.id },
			}
		});
	}

	getChannelInvite(user: User, id: number) {
		return this.notifRepo.findOne({
			where: {
				addressee: { id: user.id },
				id,
			}
		});
	}

	async sendMessageNotif(socket: AuthenticatedSocket, chanId: number) {
		const socketsInRoom = await socket.in(`channel-${chanId}`).fetchSockets() as unknown as AuthenticatedSocket[];
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
				socket.to(`user-${user.id}`).emit('NewNotification', notifToSend);
			}
		})
	}

	delete(id: number) {
		return this.notifRepo.delete(id);
	}
}
