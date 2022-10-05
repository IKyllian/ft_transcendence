// import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from "@nestjs/common";
// import { JwtGuard } from "src/auth/guard/jwt.guard";
// import { User } from "src/typeorm";
// import { GetUser } from "src/utils/decorators";
// import { ChatGateway } from "../chat.gateway";
// import { MessageDto } from "../dto/message.dto";
// import { MessageService } from "./message.service";

// @Controller('channel/:id/messages')
// export class MessageController {
// 	constructor(
// 		private messageService: MessageService,
// 		private chatGateway: ChatGateway,
// 	) {}

// 	@Post()
// 	@UseGuards(JwtGuard)
// 	async createMessage(
// 	@Param('id') chanId: number,
// 	@GetUser() user: User,
// 	@Body() msgDto: MessageDto) {
// 		const message = await this.messageService.create(chanId, user, msgDto);
// 		this.chatGateway.handleMessageToSend(message);
// 		return message;
// 	}

// 	@Get()
// 	@UseGuards(JwtGuard)
// 	async getMessages(
// 	@Param('id') chanId: number,
// 	@GetUser() user: User ) {
// 		return await this.messageService.getMessages(chanId, user);
// 	}
// }
