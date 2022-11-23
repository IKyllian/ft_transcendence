import { ClassSerializerInterceptor, forwardRef, Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "src/auth/auth.module";
import { Avatar, Friendship, MatchResult, Statistic, User } from "src/typeorm";
import { UserAccount } from "src/typeorm/entities/userAccount";
import { friendshipController } from "./friendship/friendship.controller";
import { FriendshipService } from "./friendship/friendship.service";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

@Module({
	imports: [
		forwardRef(() => AuthModule),
		TypeOrmModule.forFeature([User, Friendship, Statistic, Avatar, MatchResult, UserAccount]),
	],
	providers: [
		UserService,
		FriendshipService,
	{
		provide: APP_INTERCEPTOR,
		useClass: ClassSerializerInterceptor,
	}],
	controllers: [UserController, friendshipController],
	exports: [UserService, FriendshipService]
})
export class UserModule {}