import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Friendship, User } from "src/typeorm";
import { In, Not, Repository } from "typeorm";
import { UserService } from "../user.service";

@Injectable()
export class FriendshipService {
	constructor(
		@InjectRepository(Friendship)
		private friendshipRepo: Repository<Friendship>,
		@InjectRepository(User)
		private userRepo: Repository<User>,
		private userService: UserService,
	) {}

	getFriendRequest(user: User) {
		return this.friendshipRepo.find({
			relations: {
				requester: true,
			},
			where: {
				addressee: { id: user.id },
				status: 'requested',
			},
		});
	}

	//pas fou mais ca marche
	/**
	 * @param user 
	 * @returns List of users who can receive friend request
	 */
	async searchUsersToAdd(user: User) {
		const relation = await this.friendshipRepo.find({
			relations: {
				requester: true,
				addressee: true
			},
			// TODO, not include decline request ?
			where: [
				{
					requester: { id: user.id }
				},
				{
					addressee: { id: user.id }
				},
			]
		});
		let userRelation: Number[] = [user.id];
		relation.forEach((relation) => {
			if (relation.requester.id === user.id) {
				userRelation.push(relation.addressee.id);
			} else {
				userRelation.push(relation.requester.id);
			}
		});
		return this.userService.find({
			where: {
				id: Not(In(userRelation))
			}
		});
	}

	async sendFriendRequest(requester: User, addresseeId: number) {
		if (requester.id === addresseeId)
			throw new BadRequestException("You can't request yourself");
		const addressee = await this.userService.findOneBy({ id: addresseeId });
		if (!addressee)
			throw new NotFoundException('User not found');
		// Verify only if requester already send a friend request to addresse. Maybe need if: Friends, addresse did the request etc
		const requestFound = await this.friendshipRepo.findOne({
			where: {
				addressee: { id: addressee.id },
				requester: { id: requester.id },
				status: In(['requested', 'accepted']),
			}
		});
		if (requestFound)
			throw new BadRequestException('Already ' + requestFound.status);
		const request = this.friendshipRepo.create({ requester, addressee, status: 'requested' });
		return this.friendshipRepo.save(request);
	}

	//TODO try with query builder
	async getFriendlist(user: User) {
		const friendRequestAccepted = await this.friendshipRepo.find({
			relations: {
				requester: true,
				addressee: true
			},
			where: [
				{ requester: {
					id: user.id,
				}, status: 'accepted' },

				{ addressee: {
					id: user.id,
				}, status: 'accepted' },
			]
		});
		let friendList: User[] = [];
		friendRequestAccepted.forEach((friendship) => {
			if (friendship.requester.id === user.id) {
				friendList.push(friendship.addressee);
			} else {
				friendList.push(friendship.requester);
			}
		});
		return friendList;

		return this.userRepo
			.createQueryBuilder("user")
			.leftJoinAndSelect(Friendship, "friends" , "friends.requester = user")
			.getMany()
	}

}

// async respondFriendRequest(addressee: User, requester: User, status: friendShipStatus) {
// 	const friendship = await Friendship.findOne({
// 		where: { addressee: {
// 			id: addressee.id,
// 		},
// 		requester: {
// 			id: requester.id,
// 		}, status: 'requested' },
// 	});
// 	if (!friendship) {
// 		throw new Error('Request not found');
// 	}
// 	friendship.status = status;
// 	return await friendship.save();
// }
