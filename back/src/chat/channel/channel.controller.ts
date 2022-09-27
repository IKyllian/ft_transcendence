import { Body, ClassSerializerInterceptor, Controller, Get, Param, ParseIntPipe, Post, UseGuards, UseInterceptors } from "@nestjs/common";
import { JwtGuard } from "src/auth/guard/jwt.guard";
import { Channel, ChannelUser, User } from "src/typeorm";
import { GetChannelUser, GetUser } from "src/utils/decorators";
import { ChatGateway } from "../chat.gateway";
import { ChannelPasswordDto } from "../dto/channel-pwd.dto";
import { ChannelDto } from "../dto/channel.dto";
import { ChannelPermissionGuard } from "../guards/channel-permission.guard";
import { InChannelGuard } from "../guards/inChannel.guard";
import { ChannelService } from "./channel.service";

@Controller('channel')
export class ChannelController {
	constructor(
		private channelService: ChannelService,
		private chatGateway: ChatGateway,
		) {}

	@Get()
	@UseGuards(JwtGuard)
	getVisibleChannels(@GetUser('id') user_id: number) {
		return this.channelService.getVisibleChannels(user_id);
	}

	@Get('my_channels')
	@UseGuards(JwtGuard)
	getChannelsByUser(@GetUser('id') id: number) {
		return this.channelService.getChannelsByUser(id);
	}

	@Post()
	@UseGuards(JwtGuard)
	createChannel(@GetUser() user: User, @Body() channelDto: ChannelDto) {
		console.log('test')
		return this.channelService.create(user, channelDto);
	}

	@Post(':id/join')
	@UseGuards(JwtGuard)
	joinChannel(
		@GetUser() user: User,
		@Param('id', ParseIntPipe) id: number,
		@Body() passDto: ChannelPasswordDto ) {
		return this.channelService.join(user, id, passDto);
	}

	@Post(':id/leave')
	@UseGuards(JwtGuard)
	leaveChannel(
		@GetUser() user: User,
		@Param('id', ParseIntPipe) id: number) {
		// add reason ?
		return this.channelService.leave(user, id);
	}

	//test
	@Get(':id')
	@UseGuards(JwtGuard)
	async getChannel(
		@Param('id', ParseIntPipe) id: number,
		@GetUser() user: User,
		) {
		const channel = await this.channelService.getChannelById(user, id);
		// this.chatGateway.handleJoinConversation(user, channel.id);
		return channel;

	}

	// @UseGuards(JwtGuard, InChannelGuard, ChannelPermissionGuard)
	// @Post(':id/ban/:userId')
	// banUser(
	// @GetChannelUser() user: ChannelUser,
	// @Param('id', ParseIntPipe) channelId: number,
	// @Param('userId', ParseIntPipe) userId: number) {
	// 	return this.channelService.banUser(user, channelId, userId);
	// }

	// @UseGuards(JwtGuard, InChannelGuard, ChannelPermissionGuard)
	// @Post(':id/unban/:userId')
	// unbanUser(
	// @GetChannelUser() user: ChannelUser,
	// @Param('id', ParseIntPipe) channelId: number,
	// @Param('userId', ParseIntPipe) userId: number) {
	// 	return this.channelService.unbanUser(user, channelId, userId);
	// }
}

