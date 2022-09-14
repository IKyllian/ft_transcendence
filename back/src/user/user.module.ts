import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Avatar } from "src/entities/avatar.entity";
import { Friendship } from "src/entities/friendship.entity";
import { Statistic } from "src/entities/statistic.entity";
import { User } from "src/entities/user.entity";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

@Module({
	imports: [
		TypeOrmModule.forFeature([User, Friendship, Statistic, Avatar]),
	],
	providers: [UserService],
	controllers: [UserController],
	exports: [UserService]
})
export class UserModule {}