import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Conversation, PrivateMessage, User } from "src/typeorm";
import { UserService } from "src/user/user.service";
import { Repository } from "typeorm";
import { ConversationService } from "../conversation.service";
import { PrivateMessageDto } from "./dto/privateMessage.dto";

@Injectable()
export class PrivateMessageService {
	constructor(
		@InjectRepository(PrivateMessage)
		private privateMsgRepo: Repository<PrivateMessage>,
		@InjectRepository(Conversation)
		private convRepo: Repository<Conversation>,

		private convService: ConversationService,
		private userService: UserService,
	) {}

	async create(user: User, dto: PrivateMessageDto) {
		const conv = await this.convService.getConversationWithUsers(user.id, dto.adresseeId);
		if (!conv) {
			throw new NotFoundException('Conversation not found');
		}
		await this.userService.userBlocked(user.id, dto.adresseeId);
		const msg = this.privateMsgRepo.create({
			sender: user,
			content: dto.content,
			conversation: conv,
		});
		conv.updated_at = new Date();
		await this.convRepo.save(conv);
		return this.privateMsgRepo.save(msg);
	}
}