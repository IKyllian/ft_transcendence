import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
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
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Repository } from "typeorm";
import * as nodemailer from 'nodemailer';
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { v4 as uuidv4 } from "uuid";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { UserAccount } from "src/typeorm/entities/userAccount";

@Injectable()
export class AuthService {

	constructor(
		private jwt: JwtService,
		private config: ConfigService,
		private userService: UserService,
		private readonly httpService: HttpService,
		
		@InjectRepository(User)
		private userRepo: Repository<User>,
		@InjectRepository(UserAccount)
		private accountRepo: Repository<UserAccount>,
	) {}


	private transporter : nodemailer.Transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.MAIL_USER,
			pass: process.env.MAIL_PASSWORD
		}
	})

	async signup(dto: SignupDto) {
		if (await this.userService.nameTaken(dto.username))
			throw new ForbiddenException('Username already in use');
		if (await this.userService.mailTaken(dto.email))
			throw new ForbiddenException('Email already in use');

		const hash = await argon.hash(dto.password);	
		const user_account_create = this.accountRepo.create({ hash });
		const params = {
			username: dto.username,
			email: dto.email,
			account: user_account_create,
		}

		const user = await this.userService.create(params);
		const tokens = await this.signTokens(user.id, user.username);
		this.updateRefreshHash(user.account, tokens.refresh_token);
		return {
			access_token: tokens.access_token,
			refresh_token: tokens.refresh_token,
			user: user,
		}
	}

	async login(dto: LoginDto) {
		const user: User = await this.userRepo
			.createQueryBuilder("user")
			.where("LOWER(user.username) = :name", { name: dto.username.toLowerCase() })
			.orWhere("LOWER(user.email) = :email", { email: dto.username.toLowerCase() })
			.leftJoinAndSelect("user.channelUser", "ChannelUser")
			.leftJoinAndSelect("ChannelUser.channel", "Channel")
			.leftJoinAndSelect("user.account", "account")
			.leftJoinAndSelect("user.blocked", "Blocked")
			.getOne();

		if (!user || user.id42 || !user.account.hash) {
			throw new NotFoundException('invalid credentials')
		}

		const pwdMatches = await argon.verify(
			user.account.hash,
			dto.password,
		);
		if (!pwdMatches)
			throw new BadRequestException('invalid credentials');

		if (user.two_factor_enabled) {
			return {
				access_2fa_token: await this.sign2FaToken(user.id, user.username),
			};
		}

		const tokens = await this.signTokens(user.id, user.username);
		this.updateRefreshHash(user.account, tokens.refresh_token);
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
			console.log('error 42 login', error.message, code)
			throw new UnauthorizedException('Failed to retreive 42 token');
		}
	}

	async login42(dto: Auth42Dto) {
		const token = await this.get42token(dto.authorizationCode);
		const response = await lastValueFrom(this.httpService.get(`https://api.intra.42.fr/v2/me?access_token=${token}`));
		let user = await this.userService.findOne({
			relations: {
				channelUser: { channel: true },
				blocked: true,
				account: true,
			},
			where: {
				id42: response.data.id,
			}
		});
		if (!user) {
			console.log('user 42 not found, creating a new one');
			if (await this.userService.mailTaken(response.data.email)) {
				console.log("mail taken")
				throw new BadRequestException("Mail is already taken");
			}
			const account = this.accountRepo.create();
			const params = {
				account: account,
				id42: response.data.id,
				email: response.data.email,
			}
			user = await this.userService.create(params);
		}

		if (user.two_factor_enabled) {
			return {
				access_2fa_token: await this.sign2FaToken(user.id, user.username),
			};
		}

		const tokens = await this.signTokens(user.id, user.username);
		this.updateRefreshHash(user.account, tokens.refresh_token);
		return {
			access_token: tokens.access_token,
			refresh_token: tokens.refresh_token,
			user: user,
			usernameSet: user.username ? true : false,
		};
	}
	
	async signTokens(userId: number, username: string): Promise<{ access_token: string, refresh_token: string }> {
		const [access_token, refresh_token] = await Promise.all([
			this.jwt.signAsync(
				{ sub: userId, username },
				{ expiresIn: '1m', secret: this.config.get('ACCESS_SECRET') }
			),
			this.jwt.signAsync(
				{ sub: userId, username },
				{ expiresIn: '7d', secret: this.config.get('REFRESH_SECRET') }
			),
			
		])
		return { access_token, refresh_token };
	}

	sign2FaToken(userId: number, username: string): Promise<string> {
		return this.jwt.signAsync(
				{ sub: userId, username },
				{ expiresIn: '15m', secret: this.config.get('ACCESS_2FA_SECRET') }
		);
	}

	async refreshTokens(data: {account: UserAccount, refresh_token: string}) {
		const user_account = data.account;
		const refresh_token = data.refresh_token;
		if (!user_account.refresh_hash)
			throw new NotFoundException('User logged out');

		const tokensMatches = await argon.verify(user_account.refresh_hash, refresh_token);
		if (!tokensMatches)
			throw new BadRequestException('invalid token');
		
		const tokens = await this.signTokens(user_account.user.id, user_account.user.username);
		this.updateRefreshHash(user_account, tokens.refresh_token);
		return tokens;
	}

	verifyToken(token: string) {
		return this.jwt.verify(token, { secret: this.config.get('ACCESS_SECRET') });
	}

	async verify(token: string) {
		try {
			const decoded = this.jwt.verify(token, {
				secret: this.config.get('ACCESS_SECRET')
			});
			return await this.userService.findOne({
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

	async updateRefreshHash(account: UserAccount, refreshToken: string) {
		const hash = await argon.hash(refreshToken);
		this.userService.updateRefreshHash(account, hash);
	}

	async logout(user: User) {
		await this.userService.logout(user);
		return { success: true, message: "logged out successfuly" };
	}

	async forgotPassword(dto: ForgotPasswordDto) {	
		const user = await this.userService.findOne({
			select: ['username', 'email', 'id'],
			where: { 
				email: dto.email,
				id42: IsNull()
			}
		})

		if (!user)
			throw new NotFoundException("Email not found");

		const validation_code: string = uuidv4();
		await this.userService.updateForgotCode(user, validation_code);

		const message = {
            from: process.env.MAIL_USER,
            to: user.email,
            subject: 'Pong Game - Password reset request',
            html: `
            <h3>Password Reset</h3>
			<p>Hi ${user.username}, you have submitted a password reset request on <b>Pong Game</b></p>
			<p>To set your new password, <a href=http://${process.env.SERVER_IP}:3000/reset-password?code=${validation_code}>Click here</a></p>
            `,
        }

        this.transporter.sendMail(message, function(err, info) {
            if (err)
                console.log('err', err);
            else
                console.log('info', info);
        });

		return { success: true }
	}

	async resetPassword(dto: ResetPasswordDto) {
		const user_account = await this.accountRepo.findOne({
			where: { forgot_code: dto.code }
		});
		if (!user_account)
			throw new NotFoundException("Invalid code");

		const hash = await argon.hash(dto.newPassword);

		this.userService.updatePassword(user_account, hash);
		return { success: true }
	}
}