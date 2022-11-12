import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Conversation, User } from "src/typeorm";
import { UserService } from "src/user/user.service";
import { Repository } from "typeorm";
import { PrivateMessage } from "src/typeorm";

@Injectable()
export class ConversationService {
	constructor(
		@InjectRepository(Conversation)
		private convRepo: Repository<Conversation>,
		@InjectRepository(PrivateMessage)
		private msgRepo: Repository<PrivateMessage>,
		private userService: UserService,
	) {}

	async create(user: User, user2Id: number, msgContent: string) {
		const user2 = await this.userService.findOneBy({ id: user2Id });
		if (!user2)
			throw new NotFoundException('User not found');
		else if (await this.conversationExist(user.id, user2Id))
			throw new BadRequestException('Conversation already exist');
		const msg = this.msgRepo.create({
			sender: user,
			content: msgContent,
		});
		const conv = this.convRepo.create({
			user1: user,
			user2: user2,
			messages: [msg],
		 });
		 return this.convRepo.save(conv);
	}

	async conversationExist(userId: number, user2Id: number) {
		return await this.convRepo.findOne({
			relations: {
				user1: true,
				user2: true,
				messages: { sender: true },
			},
			where: [
				{
					user1: { id: userId},
					user2: { id: user2Id },
				},
				{
					user1: { id: user2Id },
					user2: { id: userId },
				}
			]
		});
	}

	async getConversation(user: User, id: number) {
		return this.convRepo.findOne({
			relations: {
				user1: true,
				user2: true,
				messages: { sender: true },
			},
			where: [
				{
					id,
					user1: { id: user.id }
				},
				{
					id,
					user2: { id: user.id }
				}
			]
		});
	}

	async getConversationByUserId(user: User, userId: number) {
		const user2 = await this.userService.findOneBy({ id: userId });
		if (!user2)
			throw new NotFoundException('User not found');
		const convExist = await this.conversationExist(user.id, user2.id);
		if (convExist)
			return convExist;
		else
			return user2;
	}

	getConversations(user: User) {
		return this.convRepo.find({
			relations: {
				user1: true,
				user2: true,
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

	async getMessages(userId: number, convId: number, skip: number) {
		const conv = await this.convRepo.findOne({
			where: [
				{ id: convId, user1: { id: userId } },
				{ id: convId, user2: { id: userId } },
			]
		});
		if (!conv)
			throw new BadRequestException("Conversation not found");

		const messages = await this.msgRepo.find({
			relations: ['sender'],
			where: {
				conversation: { id: convId },
			},
			skip: skip,
			take: 20,
			order: { send_at: 'DESC' },
		});
		return messages.reverse();
	}
}