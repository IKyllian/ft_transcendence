import { ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/entities/user.entity";
import { Statistic } from "src/entities/statistic.entity";
import { Repository } from "typeorm";
import { AuthDto } from "./dto/auth.dto";
import * as argon from 'argon2';
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { Avatar } from "src/entities/avatar.entity";
import { HttpService } from "@nestjs/axios";
import { lastValueFrom } from "rxjs";
import { UserService } from "src/user/user.service";

@Injectable()
export class AuthService {
	constructor(
		private jwt: JwtService,
		private config: ConfigService,
		private readonly httpService: HttpService,
		private userService: UserService,
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
		const user = await this.userService.findByUsername(dto.username)

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

	async get42token(code: string) {
		try {
			const response = await lastValueFrom(this.httpService.post(
				'https://api.intra.42.fr/oauth/token',
				{
						grant_type: 'authorization_code',
						client_id: this.config.get('API42_CLIENT_ID'),
						client_secret: this.config.get('API42_CLIENT_SECRET'),
						code,
						redirect_uri: this.config.get('REDIRECT_HOME'),
				}
			));
			return response.data.access_token;
		} catch(error) {
			throw new UnauthorizedException();
		}
	}

	async login42(code: string) {
		const token = await this.get42token(code);

		const response = await lastValueFrom(this.httpService.get(`https://api.intra.42.fr/v2/me?access_token=${token}`));
		let user = await this.userService.findBy42Id(response.data.id42);
		if (!user) {
			user = await this.userService.create({ 
				username: response.data.login,
				id42: response.data.id,
			});
		}
		return {
			token: await this.signToken(user.id, user.username),
			user: user,
			usernameSet: false,
		}
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