import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/entities/user.entity";
import { Statistic } from "src/entities/statistic.entity";
import { Repository } from "typeorm";
import { AuthDto } from "./dto/auth.dto";
import * as argon from 'argon2';
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { Avatar } from "src/entities/avatar.entity";

@Injectable()
export class AuthService {
	constructor(
		private jwt: JwtService,
		private config: ConfigService,
		@InjectRepository(User)
		private usersRepo: Repository<User>,
		@InjectRepository(Statistic)
		private statsRepo: Repository<Statistic>,
	) {}

	async signup(dto: AuthDto) {
		const hash = await argon.hash(dto.password);

		try {
			const user = this.usersRepo.create({
				username: dto.username,
				hash,
			});
			user.statistic = await this.statsRepo.save(new Statistic());
			await this.usersRepo.save(user);
			console.log(user);
			return this.signToken(user.id, user.username);

		} catch (error) {
			if (error.code === '23505') {
				throw new ForbiddenException('Username taken');
			}
			throw error;
		}
	}

	async login(dto: AuthDto) {
		const user = await this.usersRepo.findOne({
			where: {
				username: dto.username,
			}
		});

		if (!user)
			throw new ForbiddenException('User not found')
		
		const pwdMatches = await argon.verify(
			user.hash,
			dto.password,
		);

		if (!pwdMatches)
			throw new ForbiddenException('Password incorrect');

		console.log(user.statistic.matchWon);
		return this.signToken(user.id, user.username);
	}
	
	async signToken(userId: number, username: string): Promise<{ access_token: string }> {
		const payload = {
			sub: userId,
			username
		};

		const token = await this.jwt.signAsync(
			payload,
			{
				expiresIn: '20m',
				secret: this.config.get('JWT_SECRET')
			},
		);

		return {
			access_token: token
		};
	}
}