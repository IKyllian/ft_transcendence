import { BadRequestException, ClassSerializerInterceptor, ConflictException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException, UseInterceptors } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClassTransformer } from 'class-transformer';
import { Channel, User, ChannelUser } from 'src/typeorm';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { ChannelDto } from '../dto/channel.dto';
import { ChannelExistException, ChannelNotFoundException, NotInChannelException, UnauthorizedActionException } from 'src/utils/exceptions';
import * as argon from 'argon2';
import { CreateChannelDto } from '../dto/create-channel.dto';
import { ChannelPasswordDto } from '../dto/channel-pwd.dto';
import { channelOption, channelRole, FindChannelParams } from 'src/utils/types/types';
import { threadId } from 'worker_threads';

@Injectable()
export class ChannelService {
	constructor(
		@InjectRepository(Channel)
		private channelRepo: Repository<Channel>,
		@InjectRepository(ChannelUser)
		private channelUserRepo: Repository<ChannelUser>,
	) {}
	/**
	 * @param user_id 
	 * @returns All the channel that the user joined or that is visible
	 */
	// TODO -channel that user joined
	async getVisibleChannels(user_id: number) {
		const chan = await this.channelRepo.find({
			relations: {
				channelUsers: {
					user: true,
				},
			},
			where: [
				{ option: channelOption.PUBLIC },
				{ option: channelOption.PROTECTED },
			],
		});
		// TODO FIX
		console.log('channel joined', chan);
		return chan;
	}

	async getChannelsByUser(id: number) {
		return await this.channelRepo.find({
			where: {
				channelUsers: {
					user: {
						id,
					}
				}
			}
		});
	}

	async findOne(
		whereParams: FindChannelParams,
		selectAll?: boolean,
	) {
		const selections: (keyof Channel)[] = [
			'name',
			'id',
			'option',
			'nb',
		];
		const selectionsWithHash: (keyof Channel)[] = [...selections, 'hash'];
		const param = {
			where: whereParams,
			select: selectAll ? selectionsWithHash : selections,
			relations: {
				channelUsers: {
					user: true,
				}
			},
		};
		const channel = await this.channelRepo.findOne(param);
		return channel;
	}

	async create(user: User, dto: CreateChannelDto) {
		const channelExist = await this.findOne({ name: dto.name });
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
			nb: 1,
		};
		const channel = this.channelRepo.create(params);
		const chan = await this.channelRepo.save(channel);
		console.log(chan)
		return chan
	}

	isInChannel(channel: Channel, id: number) {
		return channel.channelUsers.find((chanUser) => chanUser.user.id === id);
	}

	async join(user: User, id: number, pwdDto?: ChannelPasswordDto) {
		const channel = await this.findOne({ id }, true)
		if (!channel)
			throw new ChannelNotFoundException();

		const inChannel = this.isInChannel(channel, user.id);
		// TODO: add check if banned when ban system is done
		if (inChannel)
			throw new BadRequestException('User already in channel');

		if (channel.option === channelOption.PROTECTED) {
			if (!pwdDto.password)
				throw new UnauthorizedException('Password is not provided');
			const pwdMatches = await argon.verify(channel.hash, pwdDto.password);
			if (!pwdMatches)
				throw new UnauthorizedException('Password incorrect');
		}
		const channelUser = this.channelUserRepo.create({ user });
		channel.channelUsers = [...channel.channelUsers, channelUser];
		channel.nb++;
		return await this.channelRepo.save(channel);
	}

	async leave(user: User, id: number) {
		console.log(user, id)
		const channel = await this.findOne({ id })
		if (!channel)
			throw new ChannelNotFoundException();
		
		const inChannel = this.isInChannel(channel, user.id);
		if (!inChannel)
			throw new BadRequestException('User not in channel');

		console.log('before leave', channel.channelUsers);
		channel.channelUsers = channel.channelUsers.filter((chanUser) => chanUser.user.id !== user.id);
			console.log('after leave', channel.channelUsers);
		await this.channelUserRepo.delete({id: inChannel.id});
		channel.nb--;
		return await this.channelRepo.save(channel);
	}

	async getChannelById(user: User, id: number) {
		const channel = await this.channelRepo.findOne({
			relations: {
				channelUsers: { user: true },
				messages: { sender: true },
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

	async getChannelUser(channel: { id: number }, user: { id: number }) {
		const userInChannel = await this.channelUserRepo.findOne({
			relations: {
				user: true,
				channel: true,
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

	async delete(id: number) {
		return await this.channelRepo.delete(id);
	}

	// async banUser(user: ChannelUser, chanId: number, userId: number) {
	// 	let channel = await this.channelRepo.findOne({
	// 		relations: {
	// 			bannedUsers: true,
	// 			users: true,
	// 		},
	// 		where: { id: chanId }
	// 	});
	// 	if (!channel)
	// 		throw new ChannelNotFoundException();
	// 	const userToBan = await this.getChannelUser(channel, { id: userId });
	// 	if (!userToBan)
	// 		throw new NotInChannelException();
	// 	else if (userToBan.role === 'owner' || user.id === userId)
	// 		throw new UnauthorizedActionException();

	// 	channel.bannedUsers.push(userToBan.user);
	// 	await ChannelUser.delete(userToBan.id);
	// 	return await this.channelRepo.save(channel)
	// }

	// async unbanUser(user: ChannelUser, chanId: number, userId: number) {
	// 	let channel = await this.channelRepo.findOne({
	// 		relations: {
	// 			bannedUsers: true,
	// 		},
	// 		where: { id: chanId }
	// 	});
	// 	if (!channel)
	// 		throw new ChannelNotFoundException();

	// 	if (!channel.bannedUsers.find(e => e.id === userId))
	// 		throw new ConflictException('User is not banned from this channel');

	// 	console.log('before unban: ', channel.bannedUsers)
	// 	channel.bannedUsers = channel.bannedUsers.filter((users) => users.id !== userId)
	// 	console.log('after unban: ', channel.bannedUsers)
	// 	return await this.channelRepo.save(channel)
	// }

	// async isBanned(user: User, channel: Channel) {
	// 	let isBanned = await this.channelRepo.findOne({
	// 		relations: {
	// 			bannedUsers: true,
	// 		},
	// 		where: { id: channel.id, bannedUsers: {id: user.id} }
	// 	});
	// 	return isBanned ? true : false;
	// }
}
