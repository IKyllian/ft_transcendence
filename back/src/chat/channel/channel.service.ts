import { BadRequestException, ForbiddenException, forwardRef, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel, User, ChannelUser, BannedUser } from 'src/typeorm';
import { FindManyOptions, FindOneOptions, FindOptionsWhere, In, Like, Not, Repository } from 'typeorm';
import { ChannelExistException, ChannelNotFoundException, NotInChannelException, UnauthorizedActionException } from 'src/utils/exceptions';
import * as argon from 'argon2';
import { CreateChannelDto } from './dto/create-channel.dto';
import { ChannelPasswordDto } from './dto/channel-pwd.dto';
import { channelOption, channelRole, FindChannelParams, ResponseType } from 'src/utils/types/types';
import { BanUserDto } from './dto/ban-user.dto';
import { UserService } from 'src/user/user.service';
import { NotificationService } from 'src/notification/notification.service';
import { ResponseDto } from '../gateway/dto/response.dto';
import { SearchToInviteInChanDto } from './dto/search-user-to-invite.dto';
import { MuteUserDto } from './dto/mute-user.dto';
import { ChangeRoleDto } from '../gateway/dto/change-role.dto';
import { ChannelInviteDto } from '../gateway/dto/channel-invite.dto';

@Injectable()
export class ChannelService {
	constructor(
		private userService: UserService,
		@Inject(forwardRef(() => NotificationService))
		private notifService: NotificationService,
		@InjectRepository(Channel)
		private channelRepo: Repository<Channel>,
		@InjectRepository(ChannelUser)
		private channelUserRepo: Repository<ChannelUser>,
		@InjectRepository(BannedUser)
		private bannedRepo: Repository<BannedUser>,
	) {}
	/**
	 * TODO C PAS FOU
	 * @param user_id 
	 * @returns All the channel that the user did not joined and that is visible
	 */
	async searchChannel(user: User) {
		// const userChannel = await this.getMyChannels(user.id);
		// let userChannelId: number[] = [];
		// userChannel.forEach((element) => {
		// 	userChannelId.push(element.id);
		// });


		// return this.channelRepo.find({
		// 	relations: {
		// 		channelUsers: {
		// 			user: true,
		// 		},
		// 	},
		// 	where: {
		// 		option: In([channelOption.PUBLIC, channelOption.PROTECTED]),
		// 		id: Not(In(userChannelId))
		// 	},
		// });

		const channelsUserHasJoined = this.channelUserRepo
  		.createQueryBuilder("channelUser")
  		.select("channelUser.channel.id")
  		.where("channelUser.user.id = :id", { id: user.id })


  		return this.channelRepo
  		.createQueryBuilder("channel")
		.innerJoinAndSelect("channel.channelUsers", "channelUsers")
  		.where("channel.id NOT IN ("+ channelsUserHasJoined.getQuery() +")")
  		.setParameters(channelsUserHasJoined.getParameters())
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
		const channelExist = await this.findOne({
			where: { name: dto.name }
		});
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

	async join(user: User, id: number, pwdDto?: ChannelPasswordDto, isInvited: Boolean = false) {
		const channel = await this.findOne({
			relations: {
				channelUsers: { user: true }
			},
			where: { id }
		}, true)
		if (!channel)
			throw new ChannelNotFoundException();

		const inChannel = this.isInChannel(channel, user.id);
		if (inChannel)
			throw new BadRequestException('User already in channel');
		
		const isBanned = await this.isBanned(user.id, id);
		if (isBanned) {
			if (isBanned.until) {
				const until = ((isBanned.until.getTime() - Date.now()) / 1000).toFixed(0)
				throw new UnauthorizedException(`You are banned from this channel for ${until} seconds`);
			}
			throw new UnauthorizedException('You are banned from this channel');
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
		const channelUser = this.channelUserRepo.create({ user });
		channel.channelUsers = [...channel.channelUsers, channelUser];
		return this.channelRepo.save(channel);
	}

	// TODO Change getchannelinvite to find by id
	async respondInvite(user: User, dto: ResponseDto) {
		const invite = await this.notifService.getChannelInvite(user, dto.id);
		if (!invite)
			throw new BadRequestException('You are not invite to this channel');
		this.notifService.delete(invite.id);
		if (dto.response === ResponseType.ACCEPTED) {
			return await this.join(user, dto.chanId, {}, true);
		}
	}

	async leave(user: User, id: number) {
		console.log(user, id)
		const channel = await this.findOne({
			relations: {
				channelUsers: { user: true }
			},
			where: { id }
		});
		if (!channel)
			throw new ChannelNotFoundException();
		
		const inChannel = this.isInChannel(channel, user.id);
		if (!inChannel)
			throw new BadRequestException('User not in channel');

		console.log('before leave', channel.channelUsers);
		channel.channelUsers = channel.channelUsers.filter((chanUser) => chanUser.user.id !== user.id);
		console.log('after leave', channel.channelUsers);
		await this.channelUserRepo.delete({id: inChannel.id});
		return this.channelRepo.save(channel);
	}

	async getChannelById(user: User, id: number) {
		const channel = await this.channelRepo.findOne({
			relations: {
				channelUsers: { user: true },
				messages: { sender: true },
				bannedUsers: { user: true },
			},
			where: {
				id: id,
			}
		});
		if (!channel)
			throw new ChannelNotFoundException();
		
		const inChannel = this.isInChannel(channel, user.id);
		if (!inChannel)
			throw new BadRequestException('User not in channel');
		return channel;
	}

	async getChannelUser(id: number, userId: number) {
		const userInChannel = await this.channelUserRepo.findOne({
			relations: {
				user: true,
				// channel: true,
			},
			where: {
				channel: {
					id,
				},
				user: {
					id: userId
				}
			}
		});
		return userInChannel;
	}

	delete(id: number) {
		return this.channelRepo.delete(id);
	}

	async banUser(user: User, dto: BanUserDto) {
		let channel = await this.channelRepo.findOne({
			relations: {
				channelUsers: { user: true },
				bannedUsers: true,
			},
			where: { id: dto.chanId }
		});
		if (!channel)
			throw new ChannelNotFoundException();

		const alreadyBanned = channel.bannedUsers.find(userBanned => userBanned.id === dto.userId);
		if (alreadyBanned)
			throw new BadRequestException('User already banned');

		const userToBan = await this.getChannelUser(channel.id, dto.userId);
		if (!userToBan)
			throw new NotInChannelException();
		else if (userToBan.role === 'owner' || user.id === dto.userId)
			throw new BadRequestException("You don't have permissions");

		let until = null;
		if (dto.time)
			until = new Date(new Date().getTime() + dto.time * 1000);
		const bannedUser = this.bannedRepo.create({
			user: userToBan.user,
			channel,
			until,
		});
		channel.bannedUsers = [...channel.bannedUsers, bannedUser];
		channel.channelUsers = channel.channelUsers.filter((users) => users.id !== userToBan.id);
		console.log("bannedUser", bannedUser)

		return this.channelRepo.save(channel)
	}

	async unbanUser(dto: BanUserDto) {
		let channel = await this.channelRepo.findOne({
			relations: {
				bannedUsers: { user: true },
			},
			where: { id: dto.chanId }
		});
		if (!channel)
			throw new ChannelNotFoundException();

		// const isBanned = await this.bannedRepo.findOne({
		// 	where: {
		// 		user: { id: dto.userId },
		// 		channel: { id: dto.chanId }
		// 	}
		// });
		// if (!isBanned)
		// 	throw new BadRequestException('User is not banned from this channel');

		channel.bannedUsers = channel.bannedUsers.filter((bannedUsers) => bannedUsers.user.id !== dto.userId)
		return this.channelRepo.save(channel)
	}

	async isBanned(userId: number, chanId: number): Promise<BannedUser | undefined> {
		const isBanned = await this.bannedRepo.findOne({
			where: {
				user: { id: userId },
				channel: { id: chanId }
			}
		});
		if (isBanned && isBanned.until) {
			if (isBanned.until.getTime() < new Date().getTime()) {
				this.bannedRepo.delete(isBanned.id);
				return undefined;
			}
		}
		return isBanned;
	}

	async muteUser(dto: MuteUserDto) {
		const toMuteChanUser = await this.getChannelUser(dto.chanId, dto.userId);
		if (!toMuteChanUser)
			throw new NotInChannelException();
		else if (toMuteChanUser.role in [channelRole.MODERATOR, channelRole.OWNER])
			throw new BadRequestException("You don't have permissions");
		
		if (dto.time)
			toMuteChanUser.mutedTime = new Date(new Date().getTime() + dto.time * 1000);
		toMuteChanUser.is_muted = true;
		return this.channelUserRepo.save(toMuteChanUser);
	}

	async unMuteUser(dto: MuteUserDto) {
		const toUnMuteChanUser = await this.getChannelUser(dto.chanId, dto.userId);
		if (!toUnMuteChanUser)
			throw new NotInChannelException();
		
		toUnMuteChanUser.is_muted = false;
		toUnMuteChanUser.mutedTime = null;
		return this.channelUserRepo.save(toUnMuteChanUser);
	}

	isMuted(chanUser: ChannelUser) {
		if (chanUser.is_muted) {
			if (chanUser.mutedTime && chanUser.mutedTime.getTime() > new Date().getTime()) {
				const until = ((chanUser.mutedTime.getTime() - Date.now()) / 1000).toFixed(0)
				throw new ForbiddenException(`You are muted for ${until} seconds`);
			}
			else if (!chanUser.mutedTime)
				throw new ForbiddenException('You are muted')
			else {
				chanUser.mutedTime = null;
				chanUser.is_muted = false;
				this.channelRepo.save(chanUser);
			}
		}
	}

	//TODO what if banned?
	async getUsersToInvite(dto: SearchToInviteInChanDto) {
		const channel = await this.channelRepo.findOne({
			relations: {
				channelUsers: { user: true },
			},
			where: { id: dto.chanId },
		});
		if (!channel)
			throw new ChannelNotFoundException();

		const usersId: number[] = [];
		channel.channelUsers.forEach((chanUser) => {
			usersId.push(chanUser.user.id);
		})
		return this.userService.find({
			where: {
				id: Not(In(usersId)),
				username: Like(`%${dto.str}%`),
			}
		});
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
}
