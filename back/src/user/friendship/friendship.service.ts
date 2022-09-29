import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Friendship, User } from "src/typeorm";
import { Any, In, Not, Repository } from "typeorm";
import { UserService } from "../user.service";

@Injectable()
export class FriendshipService {
	constructor(
		@InjectRepository(Friendship)
		private friendshipRepo: Repository<Friendship>,
		private userService: UserService,
	) {}

	async getFriendRequest(user: User) {
		return await this.friendshipRepo.find({
			relations: {
				requester: true,
			},
			where: {
				addressee: { id: user.id },
				status: 'requested',
			}
		});
	}

	getUsersToRequest(user: User) {
		
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
		return await this.friendshipRepo.save(request);
	}
}


// async getFriendlist(user: User) {
// 	const rawFriendList = await Friendship.find({
// 		relations: {
// 			requester: true,
// 			addressee: true
// 		},
// 		where: [
// 			{ requester: {
// 				id: user.id,
// 			}, status: 'accepted' },

// 			{ addressee: {
// 				id: user.id,
// 			}, status: 'accepted' },
// 		]
// 	});
// 	let friendList: User[] = [];
// 	rawFriendList.forEach((friendship) => {
// 		if (friendship.requester.id === user.id) {
// 			friendList.push(friendship.addressee);
// 		} else {
// 			friendList.push(friendship.requester);
// 		}
// 	});
// 	return friendList;
// }

// async sendFriendRequest(requester: User, addressee: User) {
// 	return Friendship.save({ requester, addressee, status: 'requested' });
// }

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
