import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from "@nestjs/common";
import { JwtGuard } from "src/auth/guard/jwt.guard";
import { User } from "src/typeorm";
import { GetUser } from "src/utils/decorators";
import { ChannelMessageService } from "./ChannelMessage.service";
import { ChannelMessageDto } from "./dto/channelMessage.dto";

@Controller('channel/:id/messages')
export class ChannelMessageController {
	constructor(
		private messageService: ChannelMessageService,
	) {}

	@Post()
	@UseGuards(JwtGuard)
	async createMessage(
	@Param('id') chanId: number,
	@GetUser() user: User,
	@Body() msgDto: ChannelMessageDto) {
		const message = await this.messageService.create(user, msgDto);
		return message;
	}

	@Get()
	@UseGuards(JwtGuard)
	async getMessages(
	@Param('id') chanId: number,
	@GetUser() user: User ) {
		return await this.messageService.getMessages(chanId, user);
	}
}

