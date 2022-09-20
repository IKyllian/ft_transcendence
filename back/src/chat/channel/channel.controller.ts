import { Controller, Get, UseGuards } from "@nestjs/common";
import { GetUser } from "src/auth/decorator/get-user.decorator";
import { JwtGuard } from "src/auth/guard/jwt.guard";
import { ChannelService } from "./channel.service";

@Controller('channel')
export class ChannelController {
	constructor(private channelService: ChannelService) {}

	@Get()
	@UseGuards(JwtGuard)
	getChannels(@GetUser('id') user_id: number) {
		// return this.channelService.getChannels(id);
	}
}