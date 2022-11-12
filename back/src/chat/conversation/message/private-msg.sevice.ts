import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PrivateMessage, User } from "src/typeorm";
import { FriendshipService } from "src/user/friendship/friendship.service";
import { UserService } from "src/user/user.service";
import { Repository } from "typeorm";
import { ConversationService } from "../conversation.service";
import { PrivateMessageDto } from "./dto/privateMessage.dto";

@Injectable()
export class PrivateMessageService {
	constructor(
		@InjectRepository(PrivateMessage)
		private privateMsgRepo: Repository<PrivateMessage>,
		private convService: ConversationService,
		private userService: UserService,
	) {}

	async create(user: User, dto: PrivateMessageDto) {
		const conv = await this.convService.conversationExist(user.id, dto.adresseeId);
		if (!conv)
		throw new NotFoundException('Conversation not found');
		await this.userService.userBlocked(user.id, dto.adresseeId);
		const msg = this.privateMsgRepo.create({
			sender: user,
			content: dto.content,
			conversation: conv,
		});
		return this.privateMsgRepo.save(msg);
	}
}