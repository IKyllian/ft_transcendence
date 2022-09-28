import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Channel, Message, User } from "src/typeorm";
import { Repository } from "typeorm";
import { ChannelService } from "../channel/channel.service";
import { MessageDto } from "../dto/message.dto";
import { ChannelNotFoundException } from "../../utils/exceptions/ChannelNotFound";
import { IsMutedException } from "../../utils/exceptions/IsMuted";
import { NotInChannelException } from "../../utils/exceptions/NotInChannel";

@Injectable()
export class MessageService {
	constructor(
		private channelService: ChannelService,
		@InjectRepository(Message)
		private messagesRepo: Repository<Message>,
	) {}

	async create(chanId: number, user: User, messageDto: MessageDto) {
		const channel = await this.channelService.findOne({ id: chanId });
		if (!channel)
			throw new ChannelNotFoundException();
		const channelUser = await this.channelService.getChannelUser(channel, user);
		if (!channelUser) { throw new NotInChannelException() } 
		if (channelUser.is_muted) { throw new IsMutedException() }

		const message = this.messagesRepo.create({
			content: messageDto.content,
			channel,
			sender: user,
		});
		return await this.messagesRepo.save(message);
	}

	async getMessages(chanId: number, user: User) {
		const channel = await this.channelService.findOne({ id: chanId });
		if (!channel)
			throw new ChannelNotFoundException();
		const channelUser = await this.channelService.getChannelUser(channel, user);
		if (!channelUser) { throw new NotInChannelException() }

		return await this.messagesRepo.find({
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