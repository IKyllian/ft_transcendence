import { ClassSerializerInterceptor, forwardRef, Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "src/auth/auth.module";
import { Avatar, Friendship, Statistic, User } from "src/typeorm";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

@Module({
	imports: [
		forwardRef(() => AuthModule),
		TypeOrmModule.forFeature([User, Friendship, Statistic, Avatar]),
	],
	providers: [UserService,
	{
		provide: APP_INTERCEPTOR,
		useClass: ClassSerializerInterceptor,
	}],
	controllers: [UserController],
	exports: [UserService]
})
export class UserModule {}