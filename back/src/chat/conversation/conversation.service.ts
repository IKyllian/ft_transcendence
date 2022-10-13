import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Conversation, User } from "src/typeorm";
import { UserService } from "src/user/user.service";
import { Repository } from "typeorm";

@Injectable()
export class ConversationService {
	constructor(
		@InjectRepository(Conversation)
		private convRepo: Repository<Conversation>,
		private userService: UserService,
	) {}

	createConversation(user: User, user2: User) {
		const conv = this.convRepo.create({
			user1: user,
			user2: user2,
		 });
		 return this.convRepo.save(conv);
	}

	async conversationExist(user: User, user2: User) {
		return await this.convRepo.findOne({
			relations: {
				user1: true,
				user2: true,
				messages: { sender: true },
			},
			where: [
				{
					user1: { id: user.id},
					user2: { id: user2.id },
				},
				{
					user1: { id: user2.id },
					user2: { id: user.id },
				}
			]
		});
	}

	async getConversation(user: User, id: number) {
		const user2 = await this.userService.findOneBy({ id });
		if (!user2)
			throw new NotFoundException('User not found');
		const convExist = await this.conversationExist(user, user2);
		if (convExist)
			return convExist;
		else
			return await this.createConversation(user, user2);
	}

	getConversations(user: User) {
		return this.convRepo.find({
			relations: {
				user1: true,
				user2: true,
				messages: true,
			},
			where: [
				{
					user1: { id: user.id },
				},
				{
					user2: { id: user.id },
				},
			]
		});
	}
}