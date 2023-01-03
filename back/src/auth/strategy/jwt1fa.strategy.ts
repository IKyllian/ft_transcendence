import { Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "src/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class Jwt1faStrategy extends PassportStrategy(Strategy, 'jwt-1fa') {
    // autorise l'utilisateur à accéder uniquement à la page pour valider son code 2fa
	constructor(
		@InjectRepository(User)
		private userRepo: Repository<User>,
		config: ConfigService,
		) {
		super({
			secretOrKey: config.get('ACCESS_2FA_SECRET'),
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
		});
	}

	async validate(payload: {
		sub: number;
		username: string;
	}) {
		const user: User = await this.userRepo
			.createQueryBuilder("user")
			.where("user.id = :userId", { userId: payload.sub })
			.addSelect("user.email")
			.leftJoinAndSelect("user.account", "account")
			.leftJoinAndSelect("user.channelUser", "ChannelUser")
			.leftJoinAndSelect("ChannelUser.channel", "Channel")
			.leftJoinAndSelect("user.blocked", "Blocked")
			.getOne();
		if (!user) {
			throw new NotFoundException('User not found')
		}
		return user;
	}
}