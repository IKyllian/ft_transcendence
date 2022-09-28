import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from "@nestjs/common";
import { JwtGuard } from "src/auth/guard/jwt.guard";
import { ChatGateway } from "src/chat/gateway/chat.gateway";
import { User } from "src/typeorm";
import { GetUser } from "src/utils/decorators";
import { ChannelMessageService } from "./ChannelMessage.service";
import { ChannelMessageDto } from "./dto/channelMessage.dto";

@Controller('channel/:id/messages')
export class ChannelMessageController {
	constructor(
		private messageService: ChannelMessageService,
		private chatGateway: ChatGateway,
	) {}

	@Post()
	@UseGuards(JwtGuard)
	async createMessage(
	@Param('id') chanId: number,
	@GetUser() user: User,
	@Body() msg: ChannelMessageDto) {
		return await this.messageService.create(user, msg);
	}

	@Get()
	@UseGuards(JwtGuard)
	async getMessages(
	@Param('id') chanId: number,
	@GetUser() user: User ) {
		const msg = await this.messageService.getMessages(chanId, user);
		// this.chatGateway.sendChannelMessages(data.socketId, msg);
		return msg;
	}
}

