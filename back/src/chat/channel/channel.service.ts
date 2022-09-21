import { ClassSerializerInterceptor, ForbiddenException, Injectable, UseInterceptors } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClassTransformer } from 'class-transformer';
import { Channel, User, UserInChannel } from 'src/typeorm';
import { chanRole } from 'src/typeorm/entities/userInChannel';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { ChannelDto } from '../dto/channel.dto';
import { ChannelExistException } from '../exceptions/ChannelExist';
import { ChannelNotFoundException } from '../exceptions/ChannelNotFound';

@Injectable()
export class ChannelService {
	/**
	 * @param user_id 
	 * @returns All the channel that the user joined or that is public
	 */
	async getChannels(user_id: number) {
		const chan = await Channel.find({
			relations: {
				users: {
					user: true,
				},
			},
			where: [{
				users: {
					user: {
						id: user_id,
					}
				}
			},
			{
				option: 'public',
			}]
		});
		console.log('channel joined', chan);
		return chan;
	}

	async create(user: User, dto: ChannelDto) {
		try {
			// TODO hash password if there is one
			const channel = await Channel.save(dto);
			return await this.addUser(user, channel, 'owner');
		} catch(e) {
			if (e.code === '23505')
				throw new ChannelExistException;
			throw e;
		}
	}

	async join(user: User, channelDto: ChannelDto) {
		const channel = await Channel.findOneBy({ name: channelDto.name });
		if (!channel)
			throw new ChannelNotFoundException();
		// TODO compare password
		return await this.addUser(user, channel, 'pleb');

	}

	async findUserInChannel(channel: Channel, user: User) {
		return await UserInChannel.findOne({
			relations: {
				channel: true,
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
	}

	async addUser(user: User, channel: Channel, role?: chanRole) {
		let userfound = await this.findUserInChannel(channel, user);
		
		if (userfound) {
			console.log('user already in channel');
			throw new ForbiddenException('user already in channel');
		}
		let userIn = UserInChannel.create({
			user,
			channel,
		});
		if (role)
			userIn.role = role;

		let users = await channel.users;
		if (!users) {
			console.log('no user, pushing', channel.users)
			channel.users = Promise.resolve([userIn]);
			console.log('in push', channel.users)
		}
		else {
			users.push(userIn);
			channel.users = Promise.resolve(users);
		}
		
		channel.nb++;
		// console.log(channel)
		return await Channel.save(channel);
	}
}
