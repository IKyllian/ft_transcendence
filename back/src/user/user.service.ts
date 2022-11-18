import { BadRequestException, ForbiddenException, forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindManyOptions, FindOneOptions, FindOptionsWhere, IsNull, Like, Not, Repository } from "typeorm";
import { AuthService } from "src/auth/auth.service";
import { CreateUserDto } from "./dto/createUser.dto";
import { MatchResult, Statistic, User } from "src/typeorm";
import { EditUserDto } from "./dto/editUser.dto";
import * as argon from 'argon2';
import { SearchDto } from "./dto/search.dto";
import { FriendshipService } from "./friendship/friendship.service";
import { UserStatus } from "src/utils/types/types";
import { PendingUser } from "src/typeorm/entities/pendingUser";
import { CreatePendingDto } from "./dto/createPending.dto";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class UserService {
	constructor(
		@Inject(forwardRef(() => AuthService))
		private authService: AuthService,
		private friendshipService: FriendshipService,

		@InjectRepository(User)
		private userRepo: Repository<User>,
		@InjectRepository(Statistic)
		private statisticRepo: Repository<Statistic>,
		@InjectRepository(MatchResult)
		private matchRepo: Repository<MatchResult>,
		private friendshipService: FriendshipService,
		@InjectRepository(PendingUser)
		private pendingUserRepo: Repository<PendingUser>,
	) {}

	create(dto: CreateUserDto) {
		const statistic = this.statisticRepo.create();
		const params = {...dto, statistic};
		const user = this.userRepo.create(params);
		return this.userRepo.save(user);
	}


	createPending(dto: CreatePendingDto) {
		const user = this.pendingUserRepo.create({...dto});
		return this.pendingUserRepo.save(user);
	}

	findOne(options: FindOneOptions<User>, selectAll: Boolean = false): Promise<User | null> {
		if (selectAll) {
			options.select = [
				'avatar',
				'id',
				'id42',
				'username',
				"refresh_hash",
				'status',
				'hash',
				'refresh_hash',
				'two_factor_enabled',
				'two_factor_secret',
				'two_factor_authenticated'
			];
		}
		return this.userRepo.findOne(options);
	}

	findOnePending(options: FindOneOptions<PendingUser>): Promise<PendingUser | null> {
		return this.pendingUserRepo.findOne(options);
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
		const pendingNameTaken = await this.pendingUserRepo
			.createQueryBuilder("user")
			.where("LOWER(user.username) = :name", { name: name.toLowerCase() })
			.getOne();
		return nameTaken || pendingNameTaken;
	}

	async mailTaken(email: string) {
		const mailTaken = await this.userRepo
			.createQueryBuilder("user")
			.where("LOWER(user.email) = :email", { email: email.toLowerCase() })
			.getOne();
		const pendingMailTaken = await this.pendingUserRepo
			.createQueryBuilder("user")
			.where("LOWER(user.email) = :email", { email: email.toLowerCase() })
			.getOne();
		return mailTaken || pendingMailTaken;
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

	setStatus(user: User, status: UserStatus) {
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

	logout(user: User) {
		return this.userRepo.createQueryBuilder()
		.update(User)
		.set({ refresh_hash: null })
		.where("id = :id", { id: user.id })
		.execute();

  async updateForgotCode(user: User, code: string) {
		user.forgot_code = code;
		await this.userRepo.save(user);
	}

	async updateRefreshHash(user: User, hash: string) {
		user.refresh_hash = hash;
		await this.userRepo.save(user);
	}

	async updatePassword(user: User, hash: string) {
		user.hash = hash;
		user.forgot_code = null;
		await this.userRepo.save(user);
	}

	async deleteUser(id: number) {
		const user = await this.findOneBy({ id });
		if (!user)
			throw new NotFoundException('User not found');
		await this.userRepo.delete(user.id)
	}

	async deletePending(id: number) {
		const user = await this.findOnePending({ where: {id} });
		if (!user)
			throw new NotFoundException('Pending user not found');
		await this.pendingUserRepo.delete(user.id)
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

	getMatchHistory(userId: number) {
		return this.matchRepo.createQueryBuilder("match")
		.leftJoinAndSelect("match.blue_team_player1", "bp1")
		.leftJoinAndSelect("match.blue_team_player2", "bp2")
		.leftJoinAndSelect("match.red_team_player1", "rp1")
		.leftJoinAndSelect("match.red_team_player2", "rp2")
		.where("match.blue_team_player1.id = :id")
		.orWhere("match.blue_team_player2.id = :id")
		.orWhere("match.red_team_player1.id = :id")
		.orWhere("match.red_team_player2.id = :id")
		.setParameter("id", userId)
		.orderBy("match.created_at", 'DESC')
		.getMany();
	}

	async getUserInfo(user: User, user2: User) {
		const friendList: User[] = await this.friendshipService.getFriendlist(user2);
		const relation = await this.friendshipService.getRelation(user, user2);
		const relationStatus = this.friendshipService.getRelationStatus(user2, relation);
		const match_history = await this.getMatchHistory(user2.id);
		return { user: user2, friendList, relationStatus , match_history};
	}

	async setTwoFactorSecret(user: User, secret: string) {
		user.two_factor_secret = secret;
		this.userRepo.save(user);
	}

	async setTwoFactorEnabled(user: User, status: boolean) {
		user.two_factor_enabled = status;
		if (status)
			user.two_factor_authenticated = true;
		this.userRepo.save(user);
	}

	async setTwoFactorAuthenticated(user: User, status: boolean) {
		user.two_factor_authenticated = status;
		this.userRepo.save(user);
	}
}