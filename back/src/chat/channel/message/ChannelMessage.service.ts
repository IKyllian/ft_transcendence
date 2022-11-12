import { ClassSerializerInterceptor, ForbiddenException, Injectable, UseInterceptors } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ChannelMessage, ChannelUser } from "src/typeorm";
import { ChannelNotFoundException, NotInChannelException } from "src/utils/exceptions";
import { Repository } from "typeorm";
import { ChannelService } from "../channel.service";
import { ChannelMessageDto, MessageToSkipDto } from "./dto/channelMessage.dto";

@Injectable()
@UseInterceptors(ClassSerializerInterceptor)
export class ChannelMessageService {
	constructor(
		private channelService: ChannelService,
		@InjectRepository(ChannelMessage)
		private messagesRepo: Repository<ChannelMessage>,
	) {}

	async create(chanUser: ChannelUser, messageDto: ChannelMessageDto) {
		const message = this.messagesRepo.create({
			content: messageDto.content,
			channel: { id: chanUser.channelId },
			sender: chanUser.user,
		});
		return this.messagesRepo.save(message);
	}

	async createServer(messageDto: ChannelMessageDto) {
		const message = this.messagesRepo.create({
			content: messageDto.content,
			channel: { id: messageDto.chanId },
		});
		return this.messagesRepo.save(message);
	}

	async getMessages(chanId: number, skip: number) {
		const messages = await this.messagesRepo.find({
			relations: ['sender'],
			where: {
				channel: {
					id: chanId,
				}
			},
			skip: skip,
			take: 20,
			order: { send_at: 'DESC' },
		});
		return messages.reverse();
	}
}