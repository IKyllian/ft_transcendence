import { ClassSerializerInterceptor, ForbiddenException, Injectable, UseInterceptors } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ChannelMessage, ChannelUser } from "src/typeorm";
import { Repository } from "typeorm";
import { ChannelMessageDto } from "./dto/channelMessage.dto";

@Injectable()
@UseInterceptors(ClassSerializerInterceptor)
export class ChannelMessageService {
	constructor(
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
		return this.messagesRepo.createQueryBuilder("msg")
		.where((qb) => {
			const subQuery = qb
				.subQuery()
				.from(ChannelMessage, "msg")
				.select("msg.id")
				.where("msg.channelId = :chanId")
				.orderBy("msg.send_at", "DESC")
				.skip(skip)
				.take(20)
				.getQuery()
			return "msg.id IN " + subQuery;
		})
		.setParameter("chanId", chanId)
		.leftJoinAndSelect("msg.sender", "sender")
		.orderBy("msg.send_at", 'ASC')
		.getMany();
	}
}