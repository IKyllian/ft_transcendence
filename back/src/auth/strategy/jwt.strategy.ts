import { BadRequestException, Injectable } from "@nestjs/common";
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
			secretOrKey: config.get('ACCESS_SECRET'),
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
		});
	}

	async validate(payload: {
		sub: number;
		username: string;
	}) {
		const user: User = await this.userService.findOne({
			select: [
				"id",
				"username",
				"status",
				"email",
				"avatar",
				"singles_elo",
				"doubles_elo",
				"two_factor_enabled",
				"created_at",
				"in_game_id",
			],
			relations: {
				channelUser: true,
				blocked: true,
				statistic: true,
				account: true,
			},
			where: {
				id: payload.sub,
			}
		});
		if (!user) {
            throw new BadRequestException('Invalid credential');
        }
		return user;
	}
}