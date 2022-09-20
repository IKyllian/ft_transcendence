import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Message } from "src/typeorm";
import { Repository } from "typeorm";
import { MessageDto } from "./dto/message.dto";

@Injectable()
export class MessageService {
	constructor(
		@InjectRepository(Message)
		private messagesRepo: Repository<Message>,
	) {}

	async create(messageDto: MessageDto) {
		return await this.messagesRepo.save(messageDto);
	}
}