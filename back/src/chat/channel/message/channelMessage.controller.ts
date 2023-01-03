import { Body, Controller, Param, ParseIntPipe, Post, UseGuards } from "@nestjs/common";
import { JwtGuard } from "src/auth/guard/jwt.guard";
import { InChannelGuard } from "../guards";
import { ChannelMessageService } from "./ChannelMessage.service";
import { SkipDto } from "./dto/channelMessage.dto";

@Controller('channel')
export class ChannelMessageController {
	constructor(
		private messageService: ChannelMessageService,
	) {}

	@Post(":chanId/messages")
	@UseGuards(JwtGuard, InChannelGuard)
	async getMessages(
	@Param('chanId', ParseIntPipe) chanId: number,
	@Body() data: SkipDto,
	) {
		return await this.messageService.getMessages(chanId, data.skip);
	}
}

