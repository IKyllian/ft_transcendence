import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Avatar } from "src/entities/avatar.entity";
import { Statistic } from "src/entities/statistic.entity";
import { User } from "src/entities/user.entity";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategy/jwt.strategy";

@Module({
	imports: [
		JwtModule.register({}),
		TypeOrmModule.forFeature([
			User,
			Statistic,
			Avatar,
		])
	],
	controllers: [AuthController],
	providers: [AuthService, JwtStrategy],
})
export class AuthModule {}