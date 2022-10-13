import { Controller, Get, Param, ParseIntPipe, UseGuards } from "@nestjs/common";
import { JwtGuard } from "src/auth/guard/jwt.guard";
import { User } from "src/typeorm";
import { GetUser } from "src/utils/decorators";
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

	@Get()
	@UseGuards(JwtGuard)
	async getConversations(
		@GetUser() user: User,
	) {
		return await this.convService.getConversations(user);
	}
}