import { HttpModule } from "@nestjs/axios";
import { forwardRef, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChatModule } from "src/chat/chat.module";
import { Statistic, User, UserPassHash } from "src/typeorm";
import { UserModule } from "src/user/user.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategy/jwt.strategy";

@Module({
	imports: [
		forwardRef(() => ChatModule),
		HttpModule,
		UserModule,
		// forwardRef(() => UserModule),
		JwtModule.register({
			secret: process.env.JWT_SECRET,
			signOptions: { expiresIn: '20m' }
		}),
		TypeOrmModule.forFeature([
			User,
			UserPassHash,
			Statistic,
		])
	],
	controllers: [AuthController],
	providers: [AuthService, JwtStrategy],
	exports: [AuthService],
})
export class AuthModule {}