import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from "@nestjs/common";
import { JwtGuard } from "src/auth/guard/jwt.guard";
import { User } from "src/typeorm";
import { GetUser } from "src/utils/decorators";
import { SearchDto } from "../dto/search.dto";
import { FriendshipService } from "./friendship.service";

@Controller('friend')
export class friendshipController {
	constructor(private friendshipService: FriendshipService) {}

	@UseGuards(JwtGuard)
	@Get('request')
	async getFriendRequest(@GetUser() user: User) {
		console.log(user.username)
		return await this.friendshipService.getFriendRequest(user);
	}

	@UseGuards(JwtGuard)
	@Post('search')
	async searchUserToAdd(
	@GetUser() user: User,
	@Body() dto: SearchDto,
	) {
		console.log('search user to add', dto)
		return await this.friendshipService.searchUsersToAdd(user, dto);
	}

	//TODO delete
	// @UseGuards(JwtGuard)
	// @Post(':id/add')
	// async sendFriendRequest(
	// 	@GetUser() user: User,
	// 	@Param('id', ParseIntPipe) userId: number,
	// ) {
	// 	// Not returning anything i think
	// 	return await this.friendshipService.sendFriendRequest(user, userId);
	// }

	@UseGuards(JwtGuard)
	@Get()
	async getFriendList(@GetUser() user: User) {
		return await this.friendshipService.getFriendlist(user);
	}
}