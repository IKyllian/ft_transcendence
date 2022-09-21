import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Channel, Message, User } from "src/typeorm";
import { Repository } from "typeorm";
import { ChannelService } from "../channel/channel.service";
import { MessageDto } from "../dto/message.dto";
import { ChannelNotFoundException } from "../exceptions/ChannelNotFound";
import { IsMutedException } from "../exceptions/IsMuted";
import { NotInChannelException } from "../exceptions/NotInChannel";

@Injectable()
export class MessageService {
	constructor(
		private channelService: ChannelService,
	) {}

	async create(chanId: number, user: User, messageDto: MessageDto) {
		const channel = await Channel.findOneBy({ id: chanId });
		if (!channel)
			throw new ChannelNotFoundException();
		const userInChannel = await this.channelService.findUserInChannel(channel, user);
		if (!userInChannel) { throw new NotInChannelException() } 
		if (userInChannel.is_muted) { throw new IsMutedException() }

		const message = Message.create({
			content: messageDto.content,
			channel,
			sender: user,
		});
		return await message.save();
	}

	async getMessages(chanId: number, user: User) {
		const channel = await Channel.findOneBy({ id: chanId });
		if (!channel)
			throw new ChannelNotFoundException();
		const userInChannel = await this.channelService.findUserInChannel(channel, user);
		if (!userInChannel) { throw new NotInChannelException() }

		return await Message.find({
			relations: ['sender'],
			where: {
				channel: {
					id: chanId,
				}
			},
			order: { send_at: 'DESC' },
		});
	}
}