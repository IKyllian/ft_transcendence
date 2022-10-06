import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards, UseInterceptors } from "@nestjs/common";
import { JwtGuard } from "src/auth/guard/jwt.guard";
import { Channel, ChannelUser, User } from "src/typeorm";
import { GetChannelUser, GetUser } from "src/utils/decorators";
import { ChatGateway } from "../gateway/chat.gateway";
import { ChannelPasswordDto } from "./dto/channel-pwd.dto";
import { ChannelDto } from "./dto/channel.dto";
import { ChannelPermissionGuard } from "./guards/channel-permission.guard";
import { InChannelGuard } from "./guards/inChannel.guard";
import { ChannelService } from "./channel.service";

@Controller('channel')
export class ChannelController {
	constructor(
		private channelService: ChannelService,
		private chatGateway: ChatGateway,
		) {}


	@Get('my_channels')
	@UseGuards(JwtGuard)
	async getMyChannels(@GetUser('id') id: number) {
		return await this.channelService.getMyChannels(id);
	}

	@Get('search')
	@UseGuards(JwtGuard)
	async searchChannel(@GetUser() user: User) {
		console.log('searching channel')
		const chan =  await this.channelService.searchChannel(user);
		console.log(chan)
		return chan
	}

	@Post()
	@UseGuards(JwtGuard)
	async createChannel(@GetUser() user: User, @Body() channelDto: ChannelDto) {
		return await this.channelService.create(user, channelDto);
	}

	@Post(':id/join')
	@UseGuards(JwtGuard)
	joinChannel(
		@GetUser() user: User,
		@Param('id', ParseIntPipe) id: number,
		@Body() passDto: ChannelPasswordDto ) {
			console.log('joining Channel')
		return this.channelService.join(user, id, passDto);
	}

	@Post(':id/leave')
	@UseGuards(JwtGuard)
	leaveChannel(
		@GetUser() user: User,
		@Param('id', ParseIntPipe) id: number) {
		// add reason ?
		console.log('in route leave channel')
		return this.channelService.leave(user, id);
	}

	//test
	@Get(':id')
	@UseGuards(JwtGuard)
	async getChannel(
		@Param('id', ParseIntPipe) id: number,
		@GetUser() user: User,
		) {
			return await this.channelService.getChannelById(user, id);
	}

	@Delete(':id')
	async deleteChannel(
		@Param('id') id: number,
	) {
		return await this.channelService.delete(id);
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

