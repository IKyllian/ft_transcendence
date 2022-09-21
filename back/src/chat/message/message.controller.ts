import { Body, Controller, Param, Post, UseGuards } from "@nestjs/common";
import { GetUser } from "src/auth/decorator/get-user.decorator";
import { JwtGuard } from "src/auth/guard/jwt.guard";
import { User } from "src/typeorm";
import { ConnectionOptionsReader } from "typeorm";
import { ChatGateway } from "../chat.gateway";
import { MessageDto } from "../dto/message.dto";
import { MessageService } from "./message.service";

@Controller('channel/:id/messages')
export class MessageController {
	constructor(
		private messageService: MessageService,
		private chatGateway: ChatGateway,
	) {}

	@Post()
	@UseGuards(JwtGuard)
	async createMessage(
	@Param('id') chanId: number,
	@GetUser() user: User,
	@Body() msgDto: MessageDto) {
		const message = await this.messageService.create(chanId, user, msgDto);
		this.chatGateway.handleMessageToSend(message);
	}
}

