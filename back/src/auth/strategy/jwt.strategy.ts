import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "src/typeorm";
import { UserService } from "src/user/user.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
	constructor(
		config: ConfigService,
		private userService: UserService,
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
		return await this.userService.findOne({
			relations: {
				channelUser: true,
				blocked: true,
				statistic: true,
			},
			where: {
				id: payload.sub,
			}
		});
	}
}