import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PrivateMessage, User } from "src/typeorm";
import { Repository } from "typeorm";
import { ConversationService } from "../conversation.service";
import { PrivateMessageDto } from "./dto/privateMessage.dto";

@Injectable()
export class PrivateMessageService {
	constructor(
		@InjectRepository(PrivateMessage)
		private privateMsgRepo: Repository<PrivateMessage>,
		private convService: ConversationService,
	) {}

	async create(user: User, dto: PrivateMessageDto) {
		const conv = await this.convService.getOrCreateConversation(user, dto.adresseeId);
		
		const msg = this.privateMsgRepo.create({
			sender: user,
			content: dto.content,
			conversation: conv,
		});
		return this.privateMsgRepo.save(msg);
	}
}