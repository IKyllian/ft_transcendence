import { BadRequestException, ForbiddenException, forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindManyOptions, FindOneOptions, FindOptionsWhere, IsNull, Like, Not, Repository } from "typeorm";
import { AuthService } from "src/auth/auth.service";
import { CreateUserDto } from "./dto/createUser.dto";
import { Statistic, User } from "src/typeorm";
import { userStatus } from "src/typeorm/entities/user";
import { EditUserDto } from "./dto/editUser.dto";
import * as argon from 'argon2';
import { SearchDto } from "./dto/search.dto";
import { FriendshipService } from "./friendship/friendship.service";

@Injectable()
export class UserService {
	constructor(
		@Inject(forwardRef(() => AuthService))
		private authService: AuthService,
		@InjectRepository(User)
		private userRepo: Repository<User>,
		@InjectRepository(Statistic)
		private statisticRepo: Repository<Statistic>,
		private friendshipService: FriendshipService,
	) {}

	create(dto: CreateUserDto) {
		const statistic = this.statisticRepo.create();
		const params = {...dto, statistic};
		const user = this.userRepo.create(params);
		return this.userRepo.save(user);
	}

	findOne(options: FindOneOptions<User>, selectAll: Boolean = false): Promise<User | null> {
		if (selectAll) {
			options.select = [
				'avatar',
				'id',
				'username',
				'status',
				'hash',
			];
		}
		return this.userRepo.findOne(options);
	}

	findOneBy(where: FindOptionsWhere<User> | FindOptionsWhere<User>[]): Promise<User | null> {
		return this.userRepo.findOneBy(where);
	}

	find(options?: FindManyOptions<User>): Promise<User[]> {
		return this.userRepo.find(options);
	}

	search(user: User, dto: SearchDto) {
		return this.userRepo
		.createQueryBuilder("user")
		.where("user.id != :id", { id: user.id })
		.andWhere("LOWER(user.username) LIKE :name", { name: `%${dto.str.toLowerCase()}%`})
		.take(10)
		.getMany()
	}

	async nameTaken(name: string) {
		const nameTaken = await this.userRepo
			.createQueryBuilder("user")
			.where("LOWER(user.username) = :name", { name: name.toLowerCase() })
			.getOne();
		return nameTaken ? true : false;
	}

	// TODO ask if usefull
	async editUser(user: User, dto: EditUserDto) {
		switch (dto) {
			case dto.username:
				if (await this.nameTaken(dto.username))
					throw new ForbiddenException('Username taken');
				user.username = dto.username;
			case dto.password:
				const hash = await argon.hash(dto.password);
				user.hash = hash; // probably wont work cause hash is not selected
			case dto.avatar:
				user.avatar = dto.avatar;
			default:
				break;
		}
		return this.userRepo.save(user);
	}

	async editUsername(user: User, name: string) {
		if (await this.nameTaken(name))
			throw new ForbiddenException('Username taken');
		user.username = name;
		user = await this.userRepo.save(user);
		return {
			access_token: ((await this.authService.signTokens(user.id, user.username)).access_token),
			user: user,
		}
	}

	setStatus(user: User, status: userStatus) {
		user.status = status;
		this.userRepo.save(user)
	}

	async getUsers() {
		return await this.userRepo.find();
	}

	async updateAvatar(user: User, fileName: string) {
		user.avatar = fileName;
		await this.userRepo.save(user);
	}

	async logout(user: User) {
		user.refresh_hash = null;
		this.userRepo.save(user);
	}

	async updateRefreshHash(user: User, hash: string) {
		user.refresh_hash = hash;
		await this.userRepo.save(user);
	}

	async deleteUser(id: number) {
		const user = await this.findOneBy({ id });
		if (!user)
			throw new NotFoundException('User not found');
		await this.userRepo.delete(user.id)
	}

	async blockUser(user: User, id: number) {
		const toBlock = await this.findOneBy({ id });
		if (!toBlock)
			throw new NotFoundException('User not found');
		if (this.isBlocked(user, id))
			throw new BadRequestException('User already blocked');
		user.blocked = [...user.blocked, toBlock];
		return this.userRepo.save(user);
	}

	async deblockUser(user: User, id: number) {
		user.blocked = user.blocked.filter((blocked) => blocked.id !== id);
		return this.userRepo.save(user);
	}

	isBlocked(user: User, id: number): boolean {
		const isblocked = user.blocked.find((blocked) => blocked.id === id);
		return isblocked ? true : false;
	}

	async userBlocked(requesterId: number, addresseeId: number) {
		const blocked: User[] = await this.userRepo.find({
			where: [
				{
					id: requesterId,
					blocked: { id: addresseeId },
				},
				{
					id: addresseeId,
					blocked: { id: requesterId },
				}
			]
		});

		if (blocked.length > 0) {
			if (blocked[0].id === requesterId) {
				throw new BadRequestException('You blocked that user');
			} else {
				throw new BadRequestException('You are blocked by that user');
			}
		}
	}

	async getUserInfo(user: User, user2: User) {
		const friendList: User[] = await this.friendshipService.getFriendlist(user2);
		const relation = await this.friendshipService.getRelation(user, user2);
		const relationStatus = this.friendshipService.getRelationStatus(user2, relation);
		return { user: user2, friendList, relationStatus };
	}
}