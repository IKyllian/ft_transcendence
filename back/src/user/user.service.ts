import { ForbiddenException, forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuthService } from "src/auth/auth.service";
import { CreateUserDto } from "./dto/createUser.dto";
import { Friendship, Statistic, User } from "src/typeorm";
import { friendShipStatus } from "src/typeorm/entities/friendship";
import { userStatus } from "src/typeorm/entities/user";
import { FindUserParams } from "src/utils/types/types";

@Injectable()
export class UserService {
	constructor(
		@Inject(forwardRef(() => AuthService))
		private authService: AuthService,
		@InjectRepository(User)
		private userRepo: Repository<User>,
		@InjectRepository(Statistic)
		private statisticRepo: Repository<Statistic>,
	) {}

	async create(dto: CreateUserDto) {
		const userExist = await this.userRepo.findOneBy({ username: dto.username });
		if (userExist)
			throw new ForbiddenException('Username taken');

		const statistic = this.statisticRepo.create();
		const params = {...dto, statistic};
		const user = this.userRepo.create(params);
		return await this.userRepo.save(user);
	}

	async findOne(
		whereParams: FindUserParams,
		selectAll?: boolean,
	) {
		const selections: (keyof User)[] = [
			'username',
			'id',
			'status',
		];
		const selectionsWithHash: (keyof User)[] = [...selections, 'hash'];
		const param = {
			where: whereParams,
			select: selectAll ? selectionsWithHash : selections,
			relations: ['statistic'],
		};
		return await this.userRepo.findOne(param);
	}

	async editUsername(user: User, name: string) {
		try {
			user.username = name;
			user = await this.userRepo.save(user);
			return {
				token: (await this.authService.signToken(user.id, user.username)).access_token,
				user: user,
			}
		} catch(error) {
			console.log(error.message);
			throw new ForbiddenException('Username taken');
		}
	}

	setStatus(user: User, status: userStatus) {
		user.status = status;
		this.userRepo.save(user)
	}

	async getUsers() {
		return await this.userRepo.find();
	}

	async getFriendlist(user: User) {
		const rawFriendList = await Friendship.find({
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
		rawFriendList.forEach((friendship) => {
			if (friendship.requester.id === user.id) {
				friendList.push(friendship.addressee);
			} else {
				friendList.push(friendship.requester);
			}
		});
		return friendList;
	}

	async sendFriendRequest(requester: User, addressee: User) {
		return Friendship.save({ requester, addressee, status: 'requested' });
	}

	async respondFriendRequest(addressee: User, requester: User, status: friendShipStatus) {
		const friendship = await Friendship.findOne({
			where: { addressee: {
				id: addressee.id,
			},
			requester: {
				id: requester.id,
			}, status: 'requested' },
		});
		if (!friendship) {
			throw new Error('Request not found');
		}
		friendship.status = status;
		return await friendship.save();
	}

	async updateAvatar(user: User, fileName: string) {
		user.avatar = fileName;
		await this.userRepo.save(user);
	}
}