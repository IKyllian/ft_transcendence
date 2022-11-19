import { HttpModule } from "@nestjs/axios";
import { ClassSerializerInterceptor, forwardRef, Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChatModule } from "src/chat/chat.module";
import { Statistic, User } from "src/typeorm";
import { UserAccount } from "src/typeorm/entities/userAccount";
import { UserModule } from "src/user/user.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategy/jwt.strategy";
import { Jwt1faStrategy } from "./strategy/jwt1fa.strategy";
import { RtStrategy } from "./strategy/rt.strategy";

@Module({
	imports: [
		forwardRef(() => ChatModule), // TODO pq deja?
		HttpModule,
		UserModule,
		// forwardRef(() => UserModule),
		JwtModule.register({}),
		TypeOrmModule.forFeature([
			User,
			Statistic,
			UserAccount,
		])
	],
	controllers: [AuthController],
	providers: [AuthService, RtStrategy, JwtStrategy, Jwt1faStrategy,
	{
		provide: APP_INTERCEPTOR,
		useClass: ClassSerializerInterceptor,
	}],
	exports: [AuthService],
})
export class AuthModule {}