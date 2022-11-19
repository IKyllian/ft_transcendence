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
			secretOrKey: config.get('ACCESS_SECRET'),
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
		});
	}

	async validate(payload: {
		sub: number;
		username: string;
	}) {
		const user = await this.userRepo.createQueryBuilder("user")
			.leftJoinAndSelect("user.account", "account")
			.where("user.id = :userId", { userId: payload.sub })
			.getOne()
		if (!user) {
			throw new NotFoundException('User not found')
		}
		return user;
	}
}