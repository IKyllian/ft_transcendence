import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtGuard } from "src/auth/guard/jwt.guard";
import { User } from "src/typeorm";
import { GetUser } from "src/utils/decorators";
import { ChannelPasswordDto } from "./dto/channel-pwd.dto";
import { ChannelPermissionGuard } from "./guards/channel-permission.guard";
import { InChannelGuard } from "./guards/in-channel.guard";
import { ChannelService } from "./channel.service";
import { BanUserDto } from "./dto/ban-user.dto";
import { CreateChannelDto } from "./dto/create-channel.dto";
import { SearchToInviteInChanDto } from "./dto/search-user-to-invite.dto";
import { MuteUserDto } from "./dto/mute-user.dto";
import { EditChannelNameDto } from "./dto/edit-channel-name.dto";
import { EditChannelOptionDto } from "./dto/edit-channel-option.dto";

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
		// console.log(chan)
		return chan
	}

	@Post('users_to_invite')
	@UseGuards(JwtGuard, InChannelGuard)
	async getUsersToInvite(
		@Body() dto: SearchToInviteInChanDto,
	) {
		return await this.channelService.getUsersToInvite(dto);
	}

	@Post()
	@UseGuards(JwtGuard)
	async createChannel(@GetUser() user: User, @Body() channelDto: CreateChannelDto) {
		return await this.channelService.create(user, channelDto);
	}

	@Patch('edit-name')
	@UseGuards(JwtGuard, InChannelGuard, ChannelPermissionGuard)
	async editName(@Body() dto: EditChannelNameDto) {
		return await this.channelService.editName(dto);
	}

	@Patch('edit-option')
	@UseGuards(JwtGuard, InChannelGuard, ChannelPermissionGuard)
	async editOption(@Body() dto: EditChannelOptionDto) {
		return await this.channelService.editOption(dto);
	}
}