import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { debugPort } from "process";
import { PrivateMessage, User } from "src/typeorm";
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
		const conv = await this.convService.conversationExist(user, dto.adresseeId);
		if (!conv)
			throw new NotFoundException('Conversation not found');
		if (this.userService.isBlocked(user, dto.adresseeId))
			throw new BadRequestException("You can't send message to a user you blocked");
		const user2 = await this.userService.findOne({
			relations: { blocked: true },
			where: { id: dto.adresseeId }
		});
		if (this.userService.isBlocked(user2, user.id))
			throw new BadRequestException("You are blocked by this user");
		const msg = this.privateMsgRepo.create({
			sender: user,
			content: dto.content,
			conversation: conv,
		});
		return this.privateMsgRepo.save(msg);
	}
}