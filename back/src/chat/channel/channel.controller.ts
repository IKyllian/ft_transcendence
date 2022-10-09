import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from "@nestjs/common";
import { JwtGuard } from "src/auth/guard/jwt.guard";
import { User } from "src/typeorm";
import { GetUser } from "src/utils/decorators";
import { ChannelPasswordDto } from "./dto/channel-pwd.dto";
import { ChannelPermissionGuard } from "./guards/channel-permission.guard";
import { InChannelGuard } from "./guards/inChannel.guard";
import { ChannelService } from "./channel.service";
import { BanUserDto } from "./dto/banUser.dto";
import { CreateChannelDto } from "./dto/create-channel.dto";

@Controller('channel')
export class ChannelController {
	constructor(
		private channelService: ChannelService,
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
	async createChannel(@GetUser() user: User, @Body() channelDto: CreateChannelDto) {
		return await this.channelService.create(user, channelDto);
	}

	@Post(':id/join')
	@UseGuards(JwtGuard)
	async joinChannel(
		@GetUser() user: User,
		@Param('id', ParseIntPipe) id: number,
		@Body() passDto: ChannelPasswordDto ) {
			console.log('joining Channel')
		return await this.channelService.join(user, id, passDto);
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
	// async banUser(
	// @GetUser() user: User,
	// @Param('id', ParseIntPipe) channelId: number,
	// @Param('userId', ParseIntPipe) userId: number) {
	// 	return await this.channelService.banUser(user, channelId, userId);
	// }

	// TODO redo channel guard for websocket
	@UseGuards(JwtGuard)
	@Post('ban')
	async banUser(
	@GetUser() user: User,
	@Body() dto: BanUserDto) {
		return await this.channelService.banUser(user, dto);
	}

	@UseGuards(JwtGuard, InChannelGuard, ChannelPermissionGuard)
	@Post('unban')
	unbanUser(
	@Body() dto: BanUserDto) {
		return this.channelService.unbanUser(dto);
	}
}

