import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserService } from "src/user/user.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
	constructor(
		config: ConfigService,
		private userService: UserService,
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
		return await this.userService.findOne({
			select: [
				"id",
				"id42",
				"username",
				"avatar",
				"refresh_hash",
			],
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