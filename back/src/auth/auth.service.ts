import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { LoginDto } from "./dto/login.dto";
import * as argon from 'argon2';
import { JwtService, JwtVerifyOptions } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { lastValueFrom } from "rxjs";
import { UserService } from "src/user/user.service";
import { Auth42Dto } from "./dto/auth42.dto";
import { User } from "src/typeorm";
import { SignupDto } from "./dto/signup.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as nodemailer from 'nodemailer';
import { ActivateDto } from "./dto/activate.dto";
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
		const validation_code: string = uuidv4();	
		const params = {
			username: dto.username,
			email: dto.email,
		}

		const user = await this.userService.create(params);
		console.log('user', user)
		const user_account_create = this.accountRepo.create({user, hash, validation_code});
		const account = await this.accountRepo.save(user_account_create);
		const mailResult = await this.sendValidationMail(dto.email, account.validation_code);
		if (mailResult?.error)
			return { error: mailResult.error };
		return { success: true, email: params.email }
	}

	async activate(dto: ActivateDto) {
		const user_account = await this.accountRepo.findOne({
			relations: { user : true },
			where: { validation_code: dto.code }
		});
		console.log(user_account)
		if (!user_account)
			throw new ForbiddenException('Validation code not found');

			user_account.user.register = true;
		await this.userRepo.save(user_account.user);
		
		const tokens = await this.signTokens(user_account.user.id, user_account.user.username);
		this.updateRefreshHash(user_account, tokens.refresh_token);
		return {
			access_token: tokens.access_token,
			refresh_token: tokens.refresh_token,
			user: user_account.user,
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
			// .leftJoinAndSelect("user.statistic", "Statistic")
			.leftJoinAndSelect("user.blocked", "Blocked")
			.getOne();

		console.log('user', user)
		// if (!user.register)
		// 	throw new UnauthorizedException("Email not validated");
		if (!user || user.id42 || !user.account.hash) 
			throw new NotFoundException('invalid credentials')

		this.userService.setTwoFactorAuthenticated(user, false);

		const pwdMatches = await argon.verify(
			user.account.hash,
			dto.password,
		);
		if (!pwdMatches)
			throw new UnauthorizedException('invalid credentials');

		const tokens = await this.signTokens(user.id, user.username);
		this.updateRefreshHash(user.account, tokens.refresh_token);
		return {
			access_token: tokens.access_token,
			//TODO not sure about refresh
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
				// statistic: true,
				blocked: true,
				account: true,
			},
			where: {
				id42: response.data.id,
			}
		});
		if (!user) {
			console.log('user 42 not found, creating a new one');
			user = await this.userService.create({ id42 : response.data.id, email: response.data.email });
			const user_account_create = this.accountRepo.create({user});
			await this.accountRepo.save(user_account_create);
		}

		const tokens = await this.signTokens(user.id, user.username);
		this.updateRefreshHash(user.account, tokens.refresh_token);
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
		// const user = await this.userService.findOneBy({ id: userId })
		const user_account = await this.accountRepo.findOne({
			relations: { user: true },
			where: { user: { id: userId } }
		})
		if (!user_account || !user_account.refresh_hash) // user doesn't exists OR user is logged out
			throw new NotFoundException('user not found')

		const tokensMatches = await argon.verify(user_account.refresh_hash, refreshToken);
		if (!tokensMatches)
			throw new UnauthorizedException('invalid token')
		
		const tokens = await this.signTokens(user_account.user.id, user_account.user.username);
		this.updateRefreshHash(user_account, tokens.refresh_token);
		return tokens;
	}

	verifyToken(token: string, options?: JwtVerifyOptions) {
		// if (!options)
		// 	options: JwtVerifyOptions;
		// options.secret = this.config.get('ACCESS_SECRET')
		return this.jwt.verify(token, { secret: this.config.get('ACCESS_SECRET') });
	}

	async verify(token: string) {
		try {
			const decoded = this.jwt.verify(token, {
				secret: this.config.get('ACCESS_SECRET')
			});
			return await this.userService.findOne({
				// relations: {
				// 	statistic: true,
				// 	channelUser: true,
				// 	blocked: true,
				// },
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

	private async sendValidationMail(email: string, code: string) {		
        const message = {
            from: process.env.MAIL_USER,
            to: email,
            subject: 'Pong Game - Account verification',
            html: `
            <h3>Account Verification</h3>
			<p>Hi, you have recently created an account on <b>Pong Game</b></p>
			<p>To validate your email, please <a href=http://localhost:5000/api/auth/activate?code=${code}>Click here</a></p>
            `,
        }

		try {
        	return await this.transporter.sendMail(message);
		} catch(err) {
			return { error: err };
		}
    }

	async forgotPassword(dto: ForgotPasswordDto) {		
		const user = await this.userService.findOne({
			where: { email: dto.email }
		})

		if (!user)
			throw new NotFoundException("Email not found");

		const validation_code: string = uuidv4();
		this.userService.updateForgotCode(user, validation_code);

		const message = {
            from: process.env.MAIL_USER,
            to: user.email,
            subject: 'Pong Game - Password reset request',
            html: `
            <h3>Password Reset</h3>
			<p>Hi, you have submitted a password reset request on <b>Pong Game</b></p>
			<p>To set your new password, <a href=http://localhost:5000/api/auth/reset-password?code=${validation_code}>Click here</a></p>
            `,
        }

        this.transporter.sendMail(message, function(err, info) {
            if (err)
                console.log(err);
            else
                console.log(info);
        });

		return { success: true }
	}

	async resetPassword(dto: ResetPasswordDto) {
		const user_account = await this.accountRepo.findOne({
			where: { forgot_code: dto.code }
		})

		if (!user_account)
			throw new NotFoundException("Invalid code");

		const hash = await argon.hash(dto.newPassword);

		this.userService.updatePassword(user_account, hash);
		return { success: true }
	}
}