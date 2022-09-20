import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "src/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
	constructor(
		config: ConfigService,
		@InjectRepository(User)
		private usersRepo: Repository<User>,
		) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: config.get('JWT_SECRET')
		});
	}

	async validate(payload: {
		sub: number;
		username: string;
	}) {
		const user = await this.usersRepo.findOneBy({ id: payload.sub })
		return user;
	}
}