import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel } from 'src/entities/channel.entity';
import { User } from 'src/entities/user.entity';
import { chanRole, UserInChannel } from 'src/entities/userInChannel.entity';
import { Repository } from 'typeorm';
import { ChannelDto } from './dto/channel.dto';

@Injectable()
export class ChannelService {
	constructor(
		@InjectRepository(Channel)
		private channelsRepo: Repository<Channel>,
		@InjectRepository(UserInChannel)
		private userInChanRepo: Repository<UserInChannel>,
		@InjectRepository(User)
		private userRepo: Repository<User>,
	){}

	async createChannel(channelDto: ChannelDto) {
		return await this.channelsRepo.save(channelDto);
	}

	async joinChannel(channelDto: ChannelDto, user: User) {
		let channel = await this.findbyName(channelDto.name);
		if (channel === null) {
			console.log('creating channel: ', channelDto.name, channel);
			channel = await this.createChannel(channelDto);
			await this.addUser(user, channel, 'owner');
		} else {
			await this.addUser(user, channel, 'pleb');
		}
		return await this.channelsRepo.save(channel);
	}

	async findUserInChannel(channel: Channel, user: User) {
		return await this.userInChanRepo.find({
			relations: {
				channel: true,
				user: true,
			},
			where: {
				channel: {
					id: channel.id,
				},
				user: user,
			}
		});
	}

	async findbyName(name: string) {
		return await this.channelsRepo.findOneBy({ name });
	}

	async addUser(user: User, channel: Channel, role?: chanRole) {
		let userfound = await this.findUserInChannel(channel, user);
		if (userfound.length) {
			
			// TODO: ws execption ??, FAIRE CA PROPRE
			console.log('user already in channel');
			return ;
			throw new ForbiddenException('user already in channel');
		}
		let userIn = this.userInChanRepo.create({
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
		return await this.userInChanRepo.save(userIn);
	}
}
