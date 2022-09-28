import { ClassSerializerInterceptor, Injectable, UseInterceptors } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Channel, ChannelMessage, User } from "src/typeorm";
import { ChannelNotFoundException, NotInChannelException, IsMutedException } from "src/utils/exceptions";
import { Repository } from "typeorm";
import { ChannelService } from "../channel.service";
import { ChannelMessageDto } from "./dto/channelMessage.dto";

@Injectable()
@UseInterceptors(ClassSerializerInterceptor)
export class ChannelMessageService {
	constructor(
		private channelService: ChannelService,
		@InjectRepository(ChannelMessage)
		private messagesRepo: Repository<ChannelMessage>,
	) {}

	async create(user: User, messageDto: ChannelMessageDto, chanId: number) {
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
		return this.messagesRepo.save(message);
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