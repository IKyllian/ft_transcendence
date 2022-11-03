import { ClassSerializerInterceptor, ForbiddenException, Injectable, UseInterceptors } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ChannelMessage, ChannelUser } from "src/typeorm";
import { ChannelNotFoundException, NotInChannelException } from "src/utils/exceptions";
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

	async create(userId: number, messageDto: ChannelMessageDto) {

		const chanUser = await this.channelService.getChannelUser(messageDto.chanId, userId);
		if (!chanUser) {
			throw new NotInChannelException();
		}
		const channel = await this.channelService.findOneBy({ id: messageDto.chanId });
		if (!channel)
			throw new ChannelNotFoundException();
		this.channelService.isMuted(chanUser);
		const message = this.messagesRepo.create({
			content: messageDto.content,
			channel,
			sender: chanUser.user,
		});
		return this.messagesRepo.save(message);
	}

	async createServer(messageDto: ChannelMessageDto) {
		const channel = await this.channelService.findOneBy({ id: messageDto.chanId });
		if (!channel)
			throw new ChannelNotFoundException();
		const message = this.messagesRepo.create({
			content: messageDto.content,
			channel,
		});
		return this.messagesRepo.save(message);
	}

	async getMessages(chanId: number) {
		const channel = await this.channelService.findOneBy({ id: chanId });
		if (!channel)
			throw new ChannelNotFoundException();

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