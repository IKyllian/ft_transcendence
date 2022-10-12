import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { AuthDto } from "./dto/auth.dto";
import * as argon from 'argon2';
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { lastValueFrom } from "rxjs";
import { UserService } from "src/user/user.service";
import { Auth42Dto } from "./dto/auth42.dto";
import RefreshToken from "./refresh-token.entity";
import { RefreshTokenDto } from "./dto/refresh-token.dto";

@Injectable()
export class AuthService {

	private refreshTokens: RefreshToken[] = [];

	constructor(
		private jwt: JwtService,
		private config: ConfigService,
		private userService: UserService,
		private readonly httpService: HttpService,
	) {}

	async signup(dto: AuthDto) {
		const userExist = await this.userService.findOneBy({ username: dto.username });
		if (userExist)
			throw new ForbiddenException('Username taken');

		const hash = await argon.hash(dto.password);
		const params = {
			username: dto.username,
			hash,
		}
		const user = await this.userService.create(params);
		const tokens = await this.signToken(user.id, user.username);
		return {
			token: tokens.access_token,
			refresh: tokens.refresh_token,
			user: user,
		}
	}

	async login(dto: AuthDto) {
		const user = await this.userService.findOne({
			relations: {
				channelUser: {
					channel: true,
				},
				statistic: true,
				blocked: true,
			},
			where: {
				username: dto.username,
			}
		}, true);
		if (!user)
			throw new NotFoundException('User not found')

		const pwdMatches = await argon.verify(
			user.hash,
			dto.password,
		);
		if (!pwdMatches)
			throw new UnauthorizedException('Password incorrect');

		const tokens = await this.signToken(user.id, user.username);
		return {
			token: tokens.access_token,
			refresh: tokens.refresh_token,
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
			console.log(error.message)
			throw new UnauthorizedException('Failed to retreive 42 token');
		}
	}

	async login42(dto: Auth42Dto) {
		const token = await this.get42token(dto.authorizationCode);
		const response = await lastValueFrom(this.httpService.get(`https://api.intra.42.fr/v2/me?access_token=${token}`));
		let user = await this.userService.findOne({
			relations: {
				channelUser: {
					channel: true,
				},
				statistic: true,
				blocked: true,
			},
			where: {
				id42: response.data.id,
			}
		});
		if (!user) {
			console.log('user 42 not found, creating a new one');
			user = await this.userService.create({ id42 : response.data.id });
		}

		const tokens = await this.signToken(user.id, user.username);
		return {
			token: tokens.access_token,
			refresh: tokens.refresh_token,
			user: user,
			usernameSet: user.username ? true : false,
		}
	}
	
	async signToken(userId: number, username: string): Promise<{ access_token: string, refresh_token: string }> {
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
		const refreshObject = new RefreshToken({
			id:
			  this.refreshTokens.length === 0
				? 0
				: this.refreshTokens[this.refreshTokens.length - 1].id + 1,
			userId,
		  });
		  
		  this.refreshTokens.push(refreshObject);
		return {
			refresh_token: refreshObject.sign(),
			access_token: token
		};
	}

	async verify(token: string) {
		try {
			const decoded = this.jwt.verify(token, {
				secret: this.config.get('JWT_SECRET')
			});
			return await this.userService.findOne({
				relations: {
					statistic: true,
					channelUser: true,
					blocked: true,
				},
				where: {
					id: decoded.sub,
				}
			});
		}
		catch(e) {
			return null;
		}
	}

	decodeJwt(token: string) {
		return this.jwt.decode(token);
	}

	async refresh(dto: RefreshTokenDto) {

		const refreshStr = dto.refreshToken;
		const refreshToken = await this.retrieveRefreshToken(refreshStr);

		if (!refreshToken) throw new NotFoundException('token not found')

		const user = await this.userService.findOne({
			where: {
				id: refreshToken.userId,
			}
		});

		if (!user) throw new NotFoundException('user not found')

		const token = { userId: user.id }
		const tokens = await this.signToken(user.id, user.username);
		
		return { token: tokens.refresh_token };
	}

	private retrieveRefreshToken(refreshStr: string) {
		try {
			const decode = this.jwt.verify(refreshStr, { secret: this.config.get('REFRESH_SECRET') });

			if (typeof decode === 'string') return undefined

			return Promise.resolve(this.refreshTokens.find(token => token.id === decode.id));
		} catch (error) {
			return undefined;
		}
	}
}