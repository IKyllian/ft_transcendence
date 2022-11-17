import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Conversation, User } from "src/typeorm";
import { UserService } from "src/user/user.service";
import { Brackets, Repository } from "typeorm";
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
		return this.convRepo.createQueryBuilder('conv')
			.where("conv.user1Id = :user1Id AND conv.user2Id = :user2Id", { user1Id: userId, user2Id: user2Id })
			.orWhere("conv.user1Id = :user2Id AND conv.user1Id = :user2Id", { user2Id: user2Id, user1Id: userId })
			.getOne();
	}

	async getConversationWithUsers(userId: number, user2Id: number) {
		return this.convRepo.createQueryBuilder('conv')
			.innerJoin("conv.user1", "user1")
			.innerJoin("conv.user2", "user2")
			.addSelect(["user1.id", "user2.id"])
			.where("conv.user1Id = :user1Id AND conv.user2Id = :user2Id", { user1Id: userId, user2Id: user2Id })
			.orWhere("conv.user1Id = :user2Id AND conv.user1Id = :user2Id", { user2Id: user2Id, user1Id: userId })
			.getOne();
	}

	async getConversation(user: User, id: number) {
		const subQuery = this.msgRepo.createQueryBuilder("msg")
		.where((qb) => {
			const subQuery = qb
				.subQuery()
				.from(PrivateMessage, "msg")
				.select("msg.id")
				.where("msg.conversationId = :convId")
				.orderBy("msg.send_at", "DESC")
				.skip(0)
				.take(20)
				.getQuery()
			return "msg.id IN " + subQuery;
		})
		.setParameter("convId", id)
		.orderBy("msg.send_at", 'ASC')

		return this.convRepo.createQueryBuilder('conv')
			.where("conv.id = :convId AND conv.user1Id = :userId", { convId: id, userId: user.id })
			.orWhere("conv.id = :convId AND conv.user2Id = :userId", { convId: id, userId: user.id })
			.leftJoinAndSelect("conv.user1", "user1")
			.leftJoinAndSelect("conv.user2", "user2")
			.leftJoinAndSelect("conv.messages", "messages", `messages.id IN (${subQuery.select('id').getQuery()})`)
			.leftJoinAndSelect("messages.sender", "sender")
			.getOne();
	}

	async getConversationByUserId(user: User, userId: number) {
		const user2 = await this.userService.findOneBy({ id: userId });
		if (!user2)
			throw new NotFoundException('User not found');
		const convExist = await this.conversationExist(user.id, user2.id);
		if (convExist)
			return await this.getConversation(user, convExist.id);
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
				{ user1: { id: user.id } },
				{ user2: { id: user.id } },
			]
		});
	}

	async getMessages(userId: number, convId: number, skip: number) {
		return await this.msgRepo.createQueryBuilder("msg")
		.where((qb) => {
			const subQuery = qb
				.subQuery()
				.from(PrivateMessage, "msg")
				.select("msg.id")
				.where("msg.conversationId = :convId")
				.orderBy("msg.send_at", "DESC")
				.skip(skip)
				.take(20)
				.getQuery()
			return "msg.id IN " + subQuery;
		})
		.innerJoin("msg.conversation", "conv", "conv.id = :convId", { convId: convId })
		.andWhere(
			new Brackets((qb) => {
				qb.where("conv.user1Id = :userId", { userId: userId })
				qb.orWhere("conv.user2Id = :userId", { userId: userId })
			}),
		)
		.setParameter("convId", convId)
		.leftJoinAndSelect("msg.sender", "sender")
		.orderBy("msg.send_at", 'ASC')
		.getMany();
	}
}