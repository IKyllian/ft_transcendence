import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindManyOptions, FindOneOptions, FindOptionsWhere, Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { MatchResult, Statistic, User } from "src/typeorm";
import * as argon from 'argon2';
import { SearchDto } from "./dto/search.dto";
import { FriendshipService } from "./friendship/friendship.service";
import { UserStatus } from "src/utils/types/types";
import { UserAccount } from "src/typeorm/entities/userAccount";
import { EditPasswordDto } from "./dto/edit-password.dto";
import * as sharp from 'sharp';
import * as fs from "fs";
import { promisify } from "util";
import * as path from 'path';
const readFileAsyc = promisify(fs.readFile);

@Injectable()
export class UserService {
	constructor(
		private friendshipService: FriendshipService,

		@InjectRepository(User)
		private userRepo: Repository<User>,
		@InjectRepository(Statistic)
		private statisticRepo: Repository<Statistic>,
		@InjectRepository(MatchResult)
		private matchRepo: Repository<MatchResult>,
		@InjectRepository(UserAccount)
		private accountRepo: Repository<UserAccount>,
	) {}

	create(dto: CreateUserDto) {
		const statistic = this.statisticRepo.create();
		const params = {...dto, statistic};
		const user = this.userRepo.create(params);
		return this.userRepo.save(user);
	}

	findOne(options: FindOneOptions<User>): Promise<User | null> {
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
		return nameTaken;
	}

	async mailTaken(email: string) {
		const mailTaken = await this.userRepo
			.createQueryBuilder("user")
			.where("LOWER(user.email) = :email", { email: email.toLowerCase() })
			.getOne();
		return mailTaken;
	}

	async editUsername(user: User, name: string) {
		if (await this.nameTaken(name))
			throw new ForbiddenException('Username taken');
		user.username = name;
		return this.userRepo.save(user);
	}

	async editPassword(user: User, dto: EditPasswordDto) {
		let account: UserAccount = await this.accountRepo.findOne({
			where: { user: { id: user.id } },
		});
		if (!account || !account.hash) {
			throw new BadRequestException("Account or password not set");
		}
		
		const pwdMatches = await argon.verify(
			account.hash,
			dto.old,
		);
		if (!pwdMatches) {
			throw new BadRequestException("Old password does not match");
		}

		const hash = await argon.hash(dto.new);
		account.hash = hash
		this.accountRepo.save(account);
	}

	async setStatus(userId: number, status: UserStatus) {
		this.userRepo.createQueryBuilder()
			.update(User)
			.where("id = :userId", {userId: userId})
			.set({ status: () => ":status" })
			.setParameter("status", status)
			.execute();
	}

	setInGameId(userId: number, game_id: string) {
		this.userRepo.createQueryBuilder()
			.update(User)
			.where("id = :userId", {userId: userId})
			.set({ in_game_id: () => ":game_id" })
			.setParameter("game_id", game_id)
			.execute();
	}

	async updateAvatar(user: User, fileName: string) {
		if (user.avatar) {
			try {
				fs.unlinkSync(path.join('uploads', user.avatar));
			} catch(e) {
				console.error(e);
			}
		}
		this.userRepo.createQueryBuilder()
			.update(User)
			.where('id = :id', { id: user.id })
			.set({ avatar: () => ":avatar"})
			.setParameter('avatar', fileName)
			.execute()
	}

	logout(user: User) {
		return this.accountRepo.createQueryBuilder()
		.update(UserAccount)
		.set({ refresh_hash: null })
		.where("userId = :id", { id: user.id })
		.execute();
	}

	async updateForgotCode(user: User, code: string) {
		this.accountRepo.createQueryBuilder()
		.update(UserAccount)
		.where("userId = :userId", { userId: user.id })
		.set({ forgot_code: () => ":code"})
		.setParameter('code', code)
		.execute()
	}

	async updateRefreshHash(account: UserAccount, hash: string) {
		account.refresh_hash = hash;
		await this.accountRepo.save(account);
	}

	async updatePassword(account: UserAccount, hash: string) {
		this.accountRepo.createQueryBuilder()
		.update(UserAccount)
		.where("id = :id", { id: account.id })
		.set({
			hash: () => ":hash",
			forgot_code: () => null
	 	})
		.setParameter('hash', hash)
		.execute()
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

	async setTwoFactorSecret(user: UserAccount, secret: string) {
		user.two_factor_secret = secret;
		this.accountRepo.save(user);
	}

	async setTwoFactorEnabled(user: User, status: boolean) {
		user.two_factor_enabled = status;
		this.userRepo.save(user);
	}

	async resizeImage(file: Express.Multer.File) {
		try {
			const buf = await readFileAsyc(file.path)
			await sharp(buf, { animated: true })
			.resize(300, 300)
			.webp()
			.toFile(file.path);
			return true;
		} catch {
			try {
				fs.unlinkSync(file.path);
			} catch(e) {
				console.log(e.message);
			}
			return false;
		}
	}
}
