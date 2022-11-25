import { BadRequestException, ForbiddenException, forwardRef, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel, User, ChannelUser, UserTimeout, ChannelMessage } from 'src/typeorm';
import { FindManyOptions, FindOneOptions, FindOptionsWhere, In, Like, Not, Repository } from 'typeorm';
import { ChannelExistException, ChannelNotFoundException, NotInChannelException, UnauthorizedActionException } from 'src/utils/exceptions';
import * as argon from 'argon2';
import { CreateChannelDto } from './dto/create-channel.dto';
import { ChannelPasswordDto } from './dto/channel-pwd.dto';
import { channelOption, channelRole, ChannelUpdateType, FindChannelParams, ResponseType, TimeoutType } from 'src/utils/types/types';
import { BanUserDto } from './dto/ban-user.dto';
import { UserService } from 'src/user/user.service';
import { NotificationService } from 'src/notification/notification.service';
import { ResponseDto } from '../gateway/dto/response.dto';
import { SearchToInviteInChanDto } from './dto/search-user-to-invite.dto';
import { MuteUserDto } from './dto/mute-user.dto';
import { ChangeRoleDto } from '../gateway/dto/change-role.dto';
import { ChannelInviteDto } from '../gateway/dto/channel-invite.dto';
import { Server } from 'socket.io';
import { GlobalService } from 'src/utils/global/global.service';
import { EditChannelNameDto } from './dto/edit-channel-name.dto';
import { EditChannelOptionDto } from './dto/edit-channel-option.dto';

@Injectable()
export class ChannelService {
	constructor(
		private userService: UserService,
		@Inject(forwardRef(() => NotificationService))
		private notifService: NotificationService,
		private globalService: GlobalService,

		@InjectRepository(User)
		private userRepo: Repository<User>,
		@InjectRepository(Channel)
		private channelRepo: Repository<Channel>,
		@InjectRepository(ChannelUser)
		private channelUserRepo: Repository<ChannelUser>,
		@InjectRepository(UserTimeout)
		private timeoutRepo: Repository<UserTimeout>,
		@InjectRepository(ChannelMessage)
		private messageRepo: Repository<ChannelMessage>,
	) {}
	/**
	 * TODO C PAS FOU
	 * @param user_id 
	 * @returns All the channel that the user did not joined and that is visible
	 */
	async searchChannel(user: User) {
		const channelsUserHasJoined = this.channelUserRepo
  		.createQueryBuilder("channelUser")
  		.select("channelUser.channel.id")
  		.where("channelUser.user.id = :id", { id: user.id })

  		return this.channelRepo
  		.createQueryBuilder("channel")
		.innerJoinAndSelect("channel.channelUsers", "channelUsers")
  		.where("channel.id NOT IN (" + channelsUserHasJoined.getQuery() + ")")
  		.setParameters(channelsUserHasJoined.getParameters())
		.andWhere("channel.option != :private", { private: channelOption.PRIVATE })
  		.getMany()
	}

	getMyChannels(id: number) {
		return this.channelRepo.find({
			where: { channelUsers: { user: { id } } }
		});
	}

	findOne(options: FindOneOptions<Channel>, selectAll?: Boolean): Promise<Channel | null> {
		if (selectAll) {
			options.select = [
				'name',
				'id',
				'option',
				'hash',
			];
		}
		return this.channelRepo.findOne(options);
	}

	findOneBy(where: FindOptionsWhere<Channel> | FindOptionsWhere<Channel>[]): Promise<Channel | null> {
		return this.channelRepo.findOneBy(where);
	}

	find(options?: FindManyOptions<Channel>): Promise<Channel[]> {
		return this.channelRepo.find(options);
	}

	async create(user: User, dto: CreateChannelDto) {
		const channelExist = await this.channelRepo
		.createQueryBuilder("channel")
		.where("LOWER(channel.name) = :name", { name: dto.name.toLowerCase() })
		.getOne()
		if (channelExist)
			throw new ChannelExistException();

		let hash: string = null;
		if (dto.option === channelOption.PROTECTED) {
			hash = await argon.hash(dto.password);
		}
		const channelUser = this.channelUserRepo.create({ user, role: channelRole.OWNER });
		const params = {
			name: dto.name,
			channelUsers: [channelUser],
			option: dto.option,
			hash,
		};
		const channel = this.channelRepo.create(params);
		return this.channelRepo.save(channel);
	}

	isInChannel(channel: Channel, id: number) {
		return channel.channelUsers.find((chanUser) => chanUser.user.id === id);
	}

	async join(user: User, chanId: number, pwdDto?: ChannelPasswordDto, isInvited: Boolean = false) {
		const channel = await this.findOne({ where: { id: chanId } }, true);
		if (!channel)
			throw new ChannelNotFoundException();

		const inChannel = await this.channelUserRepo.findOne({
			where: {
				channel: { id: channel.id },
				user: { id: user.id}
			}
		});
		if (inChannel)
			throw new BadRequestException('User already in channel');
		
		const isBanned = await this.isBanned(user.id, chanId);
		if (isBanned) {
			if (isBanned.until) {
				const until = ((isBanned.until.getTime() - Date.now()) / 1000).toFixed(0)
				throw new UnauthorizedException(`You are banned from this channel for ${until} seconds`);
			}
			throw new UnauthorizedException('You are perma banned from this channel');
		}
		if (!isInvited) {
			if (channel.option === channelOption.PRIVATE)
				throw new UnauthorizedException('You need an invite to join this channel');
			else if (channel.option === channelOption.PROTECTED) {
				if (!pwdDto.password)
					throw new UnauthorizedException('Password is not provided');
				const pwdMatches = await argon.verify(channel.hash, pwdDto.password);
				if (!pwdMatches)
					throw new UnauthorizedException('Password incorrect');
			}
		}
		const channelUser = this.channelUserRepo.create({ user, channel });
		return this.channelUserRepo.save(channelUser);
	}

	// TODO Change getchannelinvite to find by id
	async respondInvite(user: User, dto: ResponseDto): Promise<ChannelUser | null> {
		const invite = await this.notifService.getChannelInvite(user, dto.id);
		if (!invite)
			throw new BadRequestException('You are not invite to this channel');
		await this.notifService.delete(invite.id);
		if (dto.response === ResponseType.ACCEPTED) {
			return this.join(user, dto.chanId, {}, true);
		}
		return null;
	}

	async leave(chanUser: ChannelUser) {
		// console.log('before leave', channel.channelUsers);
		// channel.channelUsers = channel.channelUsers.filter((chanUser) => chanUser.user.id !== user.id);
		// console.log('after leave', channel.channelUsers);
		await this.channelUserRepo.delete({id: chanUser.id});
		// return this.channelRepo.save(channel);
	}

	async getChannelById(userId: number, id: number): Promise<Channel> {
		/**
		 * Return last N messages from a channel
		 */
		const subQuery = this.messageRepo.createQueryBuilder("msg")
		.where((qb) => {
			const subQuery = qb
				.subQuery()
				.from(ChannelMessage, "msg")
				.select("msg.id")
				.where("msg.channelId = :chanId")
				.orderBy("msg.send_at", "DESC")
				.skip(0)
				.take(20)
				.getQuery()
			return "msg.id IN " + subQuery;
		})
		.setParameter("chanId", id)
		.orderBy("msg.send_at", 'ASC')


		const channel = await this.channelRepo.createQueryBuilder("channel")
			.leftJoinAndSelect("channel.channelUsers", "chan_user")
			.leftJoinAndSelect("chan_user.user", "user")
			.leftJoinAndSelect("channel.messages", "messages", `messages.id IN (${subQuery.select('id').getQuery()})`)
			.leftJoinAndSelect("messages.sender", "sender")
			.leftJoinAndSelect("channel.usersTimeout", "timed_out")
			.leftJoinAndSelect("timed_out.user", "userTimeout")
			.where("channel.id = :chanId", { chanId: id })
			.getOne()

		if (!channel)
			throw new ChannelNotFoundException();
		
		const inChannel = this.isInChannel(channel, userId);
		if (!inChannel)
			throw new BadRequestException('User not in channel');
		return channel;
	}

	getChannelUser(id: number, userId: number) {
		return this.channelUserRepo.findOne({
			relations: {
				user: true,
			},
			where: {
				channel: { id },
				user: { id: userId }
			}
		});
	}

	delete(id: number) {
		return this.channelRepo.delete(id);
	}

	async banUser(requester: ChannelUser, dto: BanUserDto) {
		const alreadyBanned = await this.isBanned(dto.userId, dto.chanId);
		if (alreadyBanned)
			throw new BadRequestException('User already banned');

		const userToBan = await this.getChannelUser(dto.chanId, dto.userId);
		if (!userToBan)
			throw new NotInChannelException();
		else if (userToBan.role === channelRole.OWNER || requester.userId === dto.userId)
			throw new BadRequestException("You don't have permissions");

		let until = null;
		if (dto.time)
			until = new Date(new Date().getTime() + dto.time * 1000);

		const bannedUser = this.timeoutRepo.create({
			user: userToBan.user,
			channel: { id: dto.chanId },
			until,
			type: TimeoutType.BAN,
		});
		await this.channelUserRepo.delete(userToBan.id);

		return this.timeoutRepo.save(bannedUser);
	}

	async unbanUser(dto: BanUserDto) {
		const isBanned = await this.timeoutRepo.findOne({
			where: {
				user: { id: dto.userId },
				channel: { id: dto.chanId },
				type: TimeoutType.BAN
			}
		});
		if (!isBanned) {
			throw new BadRequestException('User is not banned');
		}
		await this.timeoutRepo.delete(isBanned.id);
		return isBanned;
	}

	async isBanned(userId: number, chanId: number): Promise<UserTimeout | undefined> {
		const isBanned = await this.timeoutRepo.findOne({
			where: {
				user: { id: userId },
				channel: { id: chanId },
				type: TimeoutType.BAN
			}
		});
		if (isBanned && isBanned.until) {
			if (isBanned.until.getTime() < new Date().getTime()) {
				await this.timeoutRepo.delete(isBanned.id);
				this.globalService.server.to(`channel-${chanId}`).emit('ChannelUpdate', { type: ChannelUpdateType.UNTIMEOUT, data: isBanned.id })
				return undefined;
			}
		}
		return isBanned;
	}

	async isMuted(chanUser: ChannelUser): Promise<boolean> {
		const isMuted = await this.timeoutRepo.findOne({
			where: {
				user: { id: chanUser.userId },
				channel: { id: chanUser.channelId },
			}
		});
		if (isMuted) {
			if (isMuted.until) {
				if (isMuted.until.getTime() < new Date().getTime()) {
					await this.timeoutRepo.delete(isMuted.id);
					// console.log("is muted", chanUser, this.globalService.server);
					this.globalService.server.to(`channel-${chanUser.channelId}`).emit('ChannelUpdate', { type: ChannelUpdateType.UNTIMEOUT, data: isMuted.id })
					return false;
				} else {
					const until = ((isMuted.until.getTime() - Date.now()) / 1000).toFixed(0)
					throw new BadRequestException(`You are muted for ${until} seconds`);
				}
			} else {
				throw new BadRequestException(`You are permanently muted`);
			}
		}
		return false;
	}

	async muteUser(requester: ChannelUser, dto: MuteUserDto): Promise<UserTimeout> {
		const alreadyMuted = await this.timeoutRepo.findOne({
			where: {
				user: { id: dto.userId },
				channel: { id: dto.chanId },
			}
		});
		if (alreadyMuted)
			throw new BadRequestException('User already muted');

		const userToMute = await this.getChannelUser(dto.chanId, dto.userId);
		if (!userToMute)
			throw new NotInChannelException();
		else if (userToMute.role === channelRole.OWNER || requester.userId === dto.userId)
			throw new BadRequestException("You don't have permissions");

		let until = null;
		if (dto.time) {
			until = new Date(new Date().getTime() + dto.time * 1000);
		}

		const mutedUser = this.timeoutRepo.create({
			user: userToMute.user,
			channel: { id: dto.chanId },
			until,
			type: TimeoutType.MUTE,
		});
		return this.timeoutRepo.save(mutedUser);
	}

	async unMuteUser(dto: MuteUserDto) {
		const chanUser: ChannelUser = await this.getChannelUser(dto.chanId, dto.userId);
		if (!chanUser) {
			throw new NotInChannelException();
		}
		const isMuted = await this.timeoutRepo.findOne({
			where: {
				user: { id: dto.userId },
				channel: { id: dto.chanId },
				type: TimeoutType.MUTE
			}
		});
		if (!isMuted) {
			throw new BadRequestException('User is not muted');
		}
		await this.timeoutRepo.delete(isMuted.id);
		return isMuted;
	}

	getUsersInChannelExecptInArgs(chanId: number, usersId: number[]) {
		const query = this.userRepo
		.createQueryBuilder("user")
		.select("user.id")
		.innerJoin("user.channelUser", "channelUser", "channelUser.channel.id = :chanId",
		{ chanId })

		if (usersId.length > 0) {
			return query
				.where("user.id NOT IN (:...usersId)", { usersId: usersId })
				.getMany();
		} else {
			return query.getMany();
		}
	}

	async getUsersToInvite(dto: SearchToInviteInChanDto) {
		const usersJoined = this.userRepo
		.createQueryBuilder("user")
		.select("user.id")
		.innerJoin("user.channelUser", "channelUser", "channelUser.channel.id = :chanId",
		{ chanId: dto.chanId })

		return this.userRepo.createQueryBuilder("user")
		.where("user.id NOT IN (" + usersJoined.getQuery() + ")")
		.setParameters(usersJoined.getParameters())
		.andWhere("LOWER(user.username) LIKE :name", { name: `%${dto.str.toLowerCase()}%` })
		.take(10)
		.getMany()
	}

	async changeUserRole(chanUser: ChannelUser, dto: ChangeRoleDto) {
		const userToChange = await this.getChannelUser(dto.chanId, dto.userId);
		if (!userToChange) { throw new NotInChannelException(); }
		let ownerPassed = false;
		switch (dto.role) {
			case channelRole.MODERATOR:
				if (chanUser.role === channelRole.OWNER && userToChange.role === channelRole.MEMBER) {
					userToChange.role = dto.role;
				}
				break;
			case channelRole.MEMBER:
				if (chanUser.role === channelRole.OWNER && userToChange.role === channelRole.MODERATOR) {
					userToChange.role = dto.role;
				}
				break;
			case channelRole.OWNER:
				if (chanUser.role === channelRole.OWNER) {
					userToChange.role = dto.role;
					ownerPassed = true;
					chanUser.role = channelRole.MODERATOR;
				}
				break;
			default:
				break;
		}
		const userChanged = await this.channelUserRepo.save(userToChange);
		return {
			userChanged,
			chanUser: ownerPassed ? await this.channelUserRepo.save(chanUser) : chanUser,
			ownerPassed
		}
	}


	async editName(dto: EditChannelNameDto) {
		let channel: Channel = await this.channelRepo.findOne({
			where: { id: dto.chanId },
		});
		if (!channel) {
			throw new ChannelNotFoundException();
		}
		channel.name = dto.name;
		return this.channelRepo.save(channel);
	}

	async editOption(dto: EditChannelOptionDto) {
		let channel: Channel = await this.channelRepo.findOne({
			where: { id: dto.chanId },
		});
		if (!channel) {
			throw new ChannelNotFoundException();
		}
		channel.option = dto.option;
		return this.channelRepo.save(channel);
	}
}
