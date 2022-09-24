import { ForbiddenException, forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuthService } from "src/auth/auth.service";
import { CreateUserDto } from "./dto/createUser.dto";
import { Friendship, Statistic, User } from "src/typeorm";
import { friendShipStatus } from "src/typeorm/entities/friendship";
import { userStatus } from "src/typeorm/entities/user";

@Injectable()
export class UserService {
	constructor(
		@Inject(forwardRef(() => AuthService))
		private authService: AuthService,
	) {}

	async create(dto: CreateUserDto) {
		try {
			const user = User.create({ username: dto.username, id42: dto.id42 });
			user.statistic = await Statistic.save(new Statistic());
			return await user.save();
		} catch (error) {
			if (error.code === '23505') {
				throw new ForbiddenException('Username taken');
			}
			throw error;
		}
	}
	
	async findById(id: number): Promise<User | undefined> {
		const user = await User.findOneBy({ id });
		if (!user)
			throw new NotFoundException('Username not found');
		return user;
	}

	async findByName(username: string): Promise<User | undefined> {
		const user = await User.findOneBy({ username });
		if (!user)
			throw new NotFoundException('Username not found');
		return user;
	}

	async editUsername(user: User, name: string) {
		try {
			user.username = name;
			await user.save();
			return {
				token: (await this.authService.signToken(user.id, user.username)).access_token,
				user: user,
			}
		} catch(error) {
			console.log(error.message);
			throw new ForbiddenException();
		}
	}

	setStatus(user: User, status: userStatus) {
		user.status = status;
		user.save()
	}

	async getUsers() {
		return await User.find();
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

	async addWin(user: User) {
		user.statistic.matchWon++;
		await user.save();
	}

	async addLoss(user: User) {
		user.statistic.matchLost++;
		await user.save();
	}

	async updateAvatar(user: User, fileName: string) {
		user.avatar = fileName;
		await user.save();
	}
}