import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from "@nestjs/common";
import { JwtGuard } from "src/auth/guard/jwt.guard";
import { User } from "src/typeorm";
import { GetUser } from "src/utils/decorators";
import { SkipDto } from "../channel/message/dto/channelMessage.dto";
import { ConversationService } from "./conversation.service";

@Controller('conversation')
export class ConversationController {
	constructor(private convService: ConversationService) {}

	@Get(':id')
	@UseGuards(JwtGuard)
	async getConversation(
		@GetUser() user: User,
		@Param('id', ParseIntPipe) id: number,
	) {
		return await this.convService.getConversation(user, id);
	}

	@Get('user/:id')
	@UseGuards(JwtGuard)
	async getConversationByUserId(
		@GetUser() user: User,
		@Param('id', ParseIntPipe) id: number,
	) {
		return await this.convService.getConversationByUserId(user, id);
	}

	@Get()
	@UseGuards(JwtGuard)
	async getConversations(
		@GetUser() user: User,
	) {
		return await this.convService.getConversations(user);
	}

	@Post(':id/messages')
	@UseGuards(JwtGuard)
	async getMessages(
	@Param('id') convId: number,
	@Body() data: SkipDto,
	@GetUser('id') userId: number,
	) {
		return await this.convService.getMessages(userId, convId, data.skip);
	}
}