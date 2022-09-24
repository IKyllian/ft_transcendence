import { ClassSerializerInterceptor, ConflictException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException, UseInterceptors } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClassTransformer } from 'class-transformer';
import { Channel, User, ChannelUser } from 'src/typeorm';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { ChannelDto } from '../dto/channel.dto';
import { channelRole } from 'src/typeorm/entities/channelUser';
import { ChannelExistException, ChannelNotFoundException, NotInChannelException, UnauthorizedActionException } from 'src/utils/exceptions';

@Injectable()
export class ChannelService {
	/**
	 * @param user_id 
	 * @returns All the channel that the user joined or that is visible
	 */
	async getVisibleChannels(user_id: number) {
		const chan = await Channel.find({
			relations: {
				users: {
					user: true,
				},
			},
			where: [
			{ users: { user: { id: user_id } } },
			{ option: 'public' },
			],
		});
		// TODO FIX
		console.log('channel joined', chan);
		return chan;
	}

	async create(user: User, dto: ChannelDto) {
		try {
			// TODO hash password if there is one
			if (dto.password) {
				
				delete dto.password;
			}
			const channel = await Channel.save(dto);
			return await this.addUser(user, channel, channelRole.OWNER);
		} catch(e) {
			if (e.code === '23505')
				throw new ChannelExistException;
			throw e;
		}
	}

	async join(user: User, id: number, pwd?: string) {
		const channel = await Channel.findOne({
			relations: {
				users: true,
			},
			where: { id }
		});
		if (!channel)
			throw new ChannelNotFoundException();
		// TODO compare password
		return await this.addUser(user, channel, channelRole.MEMBER);

	}

	async getChannelUser(channel: { id: number }, user: { id: number }) {
		const userInChannel = await ChannelUser.findOne({
			relations: {
				user: true,
			},
			where: {
				channel: {
					id: channel.id,
				},
				user: {
					id: user.id,
				}
			}
		});
		// if (!userInChannel)
		// 	throw new NotInChannelException();
		return userInChannel;
	}

	async addUser(user: User, channel: Channel, role?: channelRole) {
		let userfound = await this.getChannelUser(channel, user);
		if (userfound) {
			console.log('user already in channel');
			throw new ForbiddenException('user already in channel');
		}
		let userIn = ChannelUser.create({
			user,
			channel,
		});
		if (role)
			userIn.role = role;

		if (!channel.users)
			channel.users = [userIn];
		else
			channel.users.push(userIn);
		channel.nb++;
		return await Channel.save(channel);
	}

	async banUser(user: ChannelUser, chanId: number, userId: number) {
		let channel = await Channel.findOne({
			relations: {
				bannedUsers: true,
				users: true,
			},
			where: { id: chanId }
		});
		if (!channel)
			throw new ChannelNotFoundException();
		const userToBan = await this.getChannelUser(channel, {id: userId});
		if (!userToBan)
			throw new NotInChannelException();
		else if (userToBan.role === 'owner' || user.id === userId)
			throw new UnauthorizedActionException();

		channel.bannedUsers.push(userToBan.user);
		await ChannelUser.delete(userToBan.id);
		return await channel.save()
	}

	async unbanUser(user: ChannelUser, chanId: number, userId: number) {
		let channel = await Channel.findOne({
			relations: {
				bannedUsers: true,
			},
			where: { id: chanId }
		});
		if (!channel)
			throw new ChannelNotFoundException();

		if (!channel.bannedUsers.find(e => e.id === userId))
			throw new ConflictException('User is not banned from this channel');

		console.log('before unban: ', channel.bannedUsers)
		channel.bannedUsers = channel.bannedUsers.filter((users) => users.id !== userId)
		console.log('after unban: ', channel.bannedUsers)
		return await channel.save()
	}
}
