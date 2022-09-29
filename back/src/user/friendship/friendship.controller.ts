import { Controller, Get, Param, ParseIntPipe, Post, UseGuards } from "@nestjs/common";
import { JwtGuard } from "src/auth/guard/jwt.guard";
import { User } from "src/typeorm";
import { GetUser } from "src/utils/decorators";
import { FriendshipService } from "./friendship.service";

@Controller('friend')
export class friendshipController {
	constructor(private friendshipService: FriendshipService) {}

	@UseGuards(JwtGuard)
	@Get('request')
	getFriendRequest(
		@GetUser() user: User,
	) {
		console.log(user.username)
		return this.friendshipService.getFriendRequest(user);
	}

	@UseGuards(JwtGuard)
	@Post(':id/add')
	sendFriendRequest(
		@GetUser() user: User,
		@Param('id', ParseIntPipe) userId: number,
	) {
		return this.friendshipService.sendFriendRequest(user, userId);
	}
}