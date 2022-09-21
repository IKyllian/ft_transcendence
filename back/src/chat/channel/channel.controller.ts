import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { GetUser } from "src/auth/decorator/get-user.decorator";
import { JwtGuard } from "src/auth/guard/jwt.guard";
import { User } from "src/typeorm";
import { ChannelDto } from "../dto/channel.dto";
import { ChannelService } from "./channel.service";

@Controller('channel')
export class ChannelController {
	constructor(private channelService: ChannelService) {}

	@Get()
	@UseGuards(JwtGuard)
	getChannels(@GetUser('id') user_id: number) {
		return this.channelService.getChannels(user_id);
	}

	@Post()
	@UseGuards(JwtGuard)
	createChannel(@GetUser() user: User, @Body() channelDto: ChannelDto) {
		return this.channelService.create(user, channelDto);
	}

	@Post('join')
	@UseGuards(JwtGuard)
	joinChannel(@GetUser() user: User, @Body() channelDto: ChannelDto) {
		return this.channelService.join(user, channelDto);
	}
}