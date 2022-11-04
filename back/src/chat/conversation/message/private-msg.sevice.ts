import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
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

	async create(userId: number, dto: PrivateMessageDto) {
		const conv = await this.convService.conversationExist(userId, dto.adresseeId);
		if (!conv)
			throw new NotFoundException('Conversation not found');
		const sender = await this.userService.findOne({
			relations: { blocked: true },
			where: { id: userId },
		});
		if (this.userService.isBlocked(sender, dto.adresseeId))
			throw new BadRequestException("You can't send message to a user you blocked");
		const user2 = await this.userService.findOne({
			relations: { blocked: true },
			where: { id: dto.adresseeId }
		});
		if (this.userService.isBlocked(user2, sender.id))
			throw new BadRequestException("You are blocked by this user");
		const msg = this.privateMsgRepo.create({
			sender,
			content: dto.content,
			conversation: conv,
		});
		return this.privateMsgRepo.save(msg);
	}
}