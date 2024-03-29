import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ResponseDto } from "src/chat/gateway/dto/response.dto";
import { UserIdDto } from "src/chat/gateway/dto/user-id.dto";
import { Friendship, User } from "src/typeorm";
import { RelationStatus } from "src/utils/types/types";
import { Repository } from "typeorm";
import { SearchDto } from "../dto/search.dto";
import { UserService } from "../user.service";

@Injectable()
export class FriendshipService {
	constructor(
		@InjectRepository(Friendship)
		private friendshipRepo: Repository<Friendship>,
		@InjectRepository(User)
		private userRepo: Repository<User>,
		@Inject(forwardRef(() => UserService))
		private userService: UserService,
		) {}

	getRelationStatus(user: User, relation: Friendship) {
		let relationStatus: RelationStatus = RelationStatus.NONE;
		if (relation) {
			switch(relation.status) {
				case 'accepted':
					relationStatus = RelationStatus.FRIEND;
					break;
				case 'requested':
					if (user.id === relation.requester.id) {
						relationStatus = RelationStatus.REQUESTED;
					} else {
						relationStatus = RelationStatus.PENDIND;
					}
					break;
				default:
					break;
			}
		}
		return relationStatus;
	}

	getRelation(user: User, user2: User) {
		return this.friendshipRepo.findOne({
			relations: {
				requester: true,
				addressee: true,
			},
			where: [
				{
					requester: { id: user.id },
					addressee: { id: user2.id },
				},
				{
					requester: { id: user2.id },
					addressee: { id: user.id },
				}
			]
		});
	}

	/**
	 * @param user 
	 * @returns List of users with the relation to a user
	 */
	async searchUsersToAdd(user: User, dto: SearchDto) {
		const userList = await this.userRepo
			.createQueryBuilder("user")
			.where("LOWER(user.username) LIKE :name", { name: `%${dto.str.toLowerCase()}%` })
			.andWhere("user.id != :userId", { userId: user.id })
			.take(10)
			.getMany()

		let userInfoList = [];
		for (const userInList of userList) {
			const relation = await this.getRelation(user, userInList);
			const relationStatus = this.getRelationStatus(userInList, relation);
			if (relationStatus !== RelationStatus.FRIEND)
				userInfoList.push({ user: userInList, relationStatus });
		}
		return userInfoList;
	}

	async sendFriendRequest(requester: User, addressee: User) {
		if (requester.id === addressee.id)
			throw new BadRequestException("You can't request yourself");
		const relationFound = await this.getRelation(requester, addressee);
		if (relationFound)
			throw new BadRequestException('Already ' + relationFound.status);

		const request = this.friendshipRepo.create({ requester, addressee, status: 'requested' });
		return this.friendshipRepo.save(request);
	}

	async getFriendlist(user: User) {
		const friendShipByRequester = this.friendshipRepo
			.createQueryBuilder("friendship")
			.select("friendship.addressee.id")
			.where("friendship.requester.id = :id", { id: user.id })
			.andWhere("friendship.status = 'accepted'")

		const friendShipByAddressee = this.friendshipRepo
			.createQueryBuilder("friendship")
			.select("friendship.requester.id")
			.where("friendship.addressee.id = :id", { id: user.id })
			.andWhere("friendship.status = 'accepted'")

		return this.userRepo
			.createQueryBuilder("user")
			.where("user.id IN (" + friendShipByRequester.getQuery() + ")")
			.setParameters(friendShipByRequester.getParameters())
			.orWhere("user.id IN (" + friendShipByAddressee.getQuery() + ")")
			.setParameters(friendShipByAddressee.getParameters())
			.getMany()
	}

	async friendRequestResponse(addressee: User, requester: User, status: ResponseDto) {
		const friendship = await this.friendshipRepo.findOne({
			where: {
				addressee: { id: addressee.id },
				requester: { id: requester.id },
				status: 'requested' },
		});
		if (!friendship) {
			throw new NotFoundException('Request not found');
		}
		friendship.status = status.response;
		if (status.response === 'declined') {
			await this.friendshipRepo.delete(friendship.id);
			return friendship;
		}
		return this.friendshipRepo.save(friendship);
	}

	async unFriend(user: User, dto: UserIdDto) {
		const user2 = await this.userService.findOneBy({ id: dto.id });
		if (!user2)
			throw new NotFoundException('User not found');
		const friendship = await this.getRelation(user, user2);
		if (!friendship || friendship.status !== 'accepted')
			throw new BadRequestException('You are not friend with this user');
		await this.friendshipRepo.delete(friendship.id);
		return user2;
	}
}

