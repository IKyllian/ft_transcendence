import { HttpModule } from "@nestjs/axios";
import { ClassSerializerInterceptor, forwardRef, Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChatModule } from "src/chat/chat.module";
import { Statistic, User } from "src/typeorm";
import { UserModule } from "src/user/user.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategy/jwt.strategy";

@Module({
	imports: [
		forwardRef(() => ChatModule), // TODO pq deja?
		HttpModule,
		UserModule,
		// forwardRef(() => UserModule),
		JwtModule.register({
			secret: process.env.JWT_SECRET,
			signOptions: { expiresIn: '200m' }
		}),
		TypeOrmModule.forFeature([
			User,
			Statistic,
		])
	],
	controllers: [AuthController],
	providers: [AuthService, JwtStrategy,
	{
		provide: APP_INTERCEPTOR,
		useClass: ClassSerializerInterceptor,
	}],
	exports: [AuthService],
})
export class AuthModule {}