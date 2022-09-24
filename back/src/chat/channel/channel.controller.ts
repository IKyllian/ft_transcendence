import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from "@nestjs/common";
import { JwtGuard } from "src/auth/guard/jwt.guard";
import { Channel, ChannelUser, User } from "src/typeorm";
import { GetChannelUser, GetUser } from "src/utils/decorators";
import { ChannelDto } from "../dto/channel.dto";
import { ChannelPermissionGuard } from "../guards/channel-permission.guard";
import { InChannelGuard } from "../guards/inChannel.guard";
import { ChannelService } from "./channel.service";

@Controller('channel')
export class ChannelController {
	constructor(private channelService: ChannelService) {}

	@Get()
	@UseGuards(JwtGuard)
	getVisibleChannels(@GetUser('id') user_id: number) {
		return this.channelService.getVisibleChannels(user_id);
	}

	@Post()
	@UseGuards(JwtGuard)
	createChannel(@GetUser() user: User, @Body() channelDto: ChannelDto) {
		return this.channelService.create(user, channelDto);
	}

	@Post(':id/join')
	@UseGuards(JwtGuard)
	joinChannel(
	@GetUser() user: User,
	@Param('id', ParseIntPipe) id: number,
	@Body() password?: string ) {
		return this.channelService.join(user, id, password);
	}

	@Post('leave')
	@UseGuards(JwtGuard)
	leaveChannel(@GetUser() user: User) {

	}

	//test
	@Get(':id')
	async getChannel(@Param('id', ParseIntPipe) id: number) {
		return await Channel.findOne({
			relations: {
				users: true,
				bannedUsers: true,
			},
			where: {
				id,
			}
		});
	}

	@UseGuards(JwtGuard, InChannelGuard, ChannelPermissionGuard)
	@Post(':id/ban/:userId')
	banUser(
	@GetChannelUser() user: ChannelUser,
	@Param('id', ParseIntPipe) channelId: number,
	@Param('userId', ParseIntPipe) userId: number) {
		return this.channelService.banUser(user, channelId, userId);
	}

	@UseGuards(JwtGuard)
	@Post(':id/unban/:userId')
	unbanUser(
	@GetChannelUser() user: ChannelUser,
	@Param('id', ParseIntPipe) channelId: number,
	@Param('userId', ParseIntPipe) userId: number) {
		return this.channelService.unbanUser(user, channelId, userId);
	}
}