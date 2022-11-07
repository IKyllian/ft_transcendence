import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { LoginDto } from "./dto/login.dto";
import * as argon from 'argon2';
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { lastValueFrom } from "rxjs";
import { UserService } from "src/user/user.service";
import { Auth42Dto } from "./dto/auth42.dto";
import { User } from "src/typeorm";
import { SignupDto } from "./dto/signup.dto";
import * as nodemailer from 'nodemailer';
import * as googleapis from 'googleapis';
import { PendingUser } from "src/typeorm/entities/pendingUser";
import { ActivateDto } from "./dto/activate.dto";

@Injectable()
export class AuthService {

	constructor(
		private jwt: JwtService,
		private config: ConfigService,
		private userService: UserService,
		private readonly httpService: HttpService,
	) {}

	private transporter : nodemailer.Transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.MAIL_USER,
			pass: process.env.MAIL_PASSWORD
		}
	})
	

	/* async signup(dto: SignupDto) {
		if (await this.userService.nameTaken(dto.username))
			throw new ForbiddenException('Username taken');
		const hash = await argon.hash(dto.password);
		const params = {
			username: dto.username,
			hash,
		}
		const user = await this.userService.create(params);
		const tokens = await this.signTokens(user.id, user.username);
		this.updateRefreshHash(user, tokens.refresh_token);
		return {
			access_token: tokens.access_token,
			refresh_token: tokens.refresh_token,
			user: user,
		}
	} */

	async signup(dto: SignupDto) {
		if (await this.userService.nameTaken(dto.username))
			throw new ForbiddenException('Username already in use');
		if (await this.userService.mailTaken(dto.email))
			throw new ForbiddenException('Email already in use');
		const hash = await argon.hash(dto.password);
		const params = {
			username: dto.username,
			email: dto.email,
			hash,
		}
		const user = await this.userService.createPending(params);
		this.sendValidationMail(user);
		return {
			user: user,
		}
	}

	async activate(dto: ActivateDto) {
		const pendingUser = await this.userService.findOnePending({
			where: { validation_code: dto.code }
		});
			
		if (!pendingUser)
			throw new ForbiddenException('Validation code not found');
		
		const params = {
			username: pendingUser.username,
			email: pendingUser.email,
			hash: pendingUser.hash,
		}

		// Create final user and delete pending user
		const user = await this.userService.create(params);
		await this.userService.deletePending(pendingUser.id);
		const tokens = await this.signTokens(user.id, user.username);
		this.updateRefreshHash(user, tokens.refresh_token);
		return {
			access_token: tokens.access_token,
			refresh_token: tokens.refresh_token,
			user: user,
		}
	}

	async login(dto: LoginDto) {
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
			throw new NotFoundException('invalid credentials')

		const pwdMatches = await argon.verify(
			user.hash,
			dto.password,
		);
		if (!pwdMatches)
			throw new UnauthorizedException('invalid credentials');

		const tokens = await this.signTokens(user.id, user.username);
		this.updateRefreshHash(user, tokens.refresh_token);
		return {
			access_token: tokens.access_token,
			refresh_token: tokens.refresh_token,
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

		const tokens = await this.signTokens(user.id, user.username);
		this.updateRefreshHash(user, tokens.refresh_token);
		return {
			access_token: tokens.access_token,
			refresh_token: tokens.refresh_token,
			user: user,
			usernameSet: user.username ? true : false,
		}
	}
	
	async signTokens(userId: number, username: string): Promise<{ access_token: string, refresh_token: string }> {
		const [access_token, refresh_token] = await Promise.all([
			this.jwt.signAsync(
				{ sub: userId, username },
				{ expiresIn: '200m', secret: this.config.get('ACCESS_SECRET') }
			),
			this.jwt.signAsync(
				{ sub: userId, username },
				{ expiresIn: '7d', secret: this.config.get('REFRESH_SECRET') }
			),
			
		])
		return { access_token, refresh_token };
	}

	async refreshTokens(userId: number, refreshToken: string) {
		const user = await this.userService.findOneBy({ id: userId })
		if (!user || !user.refresh_hash) // user doesn't exists OR user is logged out
			throw new NotFoundException('user not found')

		const tokensMatches = await argon.verify(user.refresh_hash, refreshToken);
		if (!tokensMatches)
			throw new UnauthorizedException('invalid token')
		
		const tokens = await this.signTokens(user.id, user.username);
		this.updateRefreshHash(user, tokens.refresh_token);
		return tokens;
	}

	async verify(token: string) {
		try {
			const decoded = this.jwt.verify(token, {
				secret: this.config.get('ACCESS_SECRET')
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

	async updateRefreshHash(user: User, refreshToken: string) {
		const hash = await argon.hash(refreshToken);
		this.userService.updateRefreshHash(user, hash);
	}

	async logout(user: User) {
		if (user.refresh_hash == null) return;

		this.userService.logout(user);
		return { success: true, message: "logged out successfuly" };
	}

	private async sendValidationMail(user: PendingUser) {		
        const message = {
            from: process.env.MAIL_USER,
            to: user.email,
            subject: 'Pong Game account validation',
            html: `
            <h1>test !!!!</h1>
            <a href=http://localhost:3000/api/activate?code=${user.validation_code}>Click here</a>`,
        }

        this.transporter.sendMail(message, function(err, info) {
            if (err)
                console.log(err);
            else
                console.log(info);
        });
    }
}