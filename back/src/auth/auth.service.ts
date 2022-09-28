import { ForbiddenException, forwardRef, Inject, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AuthDto } from "./dto/auth.dto";
import * as argon from 'argon2';
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { lastValueFrom } from "rxjs";
import { UserService } from "src/user/user.service";
import { ChannelService } from "src/chat/channel/channel.service";
import { Statistic, User } from "src/typeorm";
import { ChannelDto } from "src/chat/dto/channel.dto";
import e from "express";

@Injectable()
export class AuthService {
	constructor(
		private jwt: JwtService,
		private config: ConfigService,
		private userService: UserService,
		private readonly httpService: HttpService,
	) {}

	async signup(dto: AuthDto) {
		
		const hash = await argon.hash(dto.password);
		const params = {
			username: dto.username,
			hash,
		}
		const user = await this.userService.create(params);
		return {
			token: await this.signToken(user.id, user.username),
			user: user,
		}
	}

	async login(dto: AuthDto) {
		const user = await this.userService.findOne({username: dto.username}, true)
		if (!user)
			throw new NotFoundException('User not found')

		const pwdMatches = await argon.verify(
			user.hash,
			dto.password,
		);
		if (!pwdMatches)
			throw new UnauthorizedException('Password incorrect');
		
		return {
			token: await this.signToken(user.id, user.username),
			user: user,
		}
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
						redirect_uri: this.config.get('API42_AUTH_REDIRECT'),
				}
			));
			return response.data.access_token;
		} catch(error) {
			console.log("error", error.message)
			throw new UnauthorizedException();
		}
	}

	async login42(code: string) {
		const token = await this.get42token(code);
		const response = await lastValueFrom(this.httpService.get(`https://api.intra.42.fr/v2/me?access_token=${token}`));
		let user = await this.userService.findOne({ id42: response.data.id });
		if (!user) {
			console.log('user 42 not found, creating a new one');
			user = await this.userService.create({ id42 : response.data.id });
		}
		return {
			token: (await this.signToken(user.id, user.username)).access_token,
			user: user,
			usernameSet: user.username ? true : false,
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
				expiresIn: '200m',
				secret: this.config.get('JWT_SECRET')
			},
		);

		return {
			access_token: token
		};
	}

	async verify(token: string) {
		try {
			const decoded = this.jwt.verify(token, {
				secret: this.config.get('JWT_SECRET')
			});
			console.log('decoded', decoded)
			return await this.userService.findOne({ id: decoded.sub });
		}
		catch(e) {
			return null;
		}
	}

	decodeJwt(token: string) {
		return this.jwt.decode(token);
	}
}