import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { JwtGuard } from "src/auth/guard/jwt.guard";
import { SkipDto } from "src/chat/channel/message/dto/channelMessage.dto";
import { User } from "src/typeorm";
import { GetUser } from "src/utils/decorators";
import { GameService } from "./game.service";

@Controller('game')
export class GameController {
	constructor(private gameService: GameService) {}

	@UseGuards(JwtGuard)
	@Get('is-playing')
	async isPlaying(
		@GetUser('id') userId: number,
	) {
		return await this.gameService.isPlaying(userId);
	}

	@UseGuards(JwtGuard)
	@Post('singles-leaderboard')
	async getSinglesLeaderboard(
		@GetUser() user: User,
		@Body() data: SkipDto,
	) {
		return await this.gameService.getSinglesLeaderboard(user, data.skip);
	}

	@UseGuards(JwtGuard)
	@Post('doubles-leaderboard')
	async getDoublesLeaderboard(
		@Body() data: SkipDto,
	) {
		return await this.gameService.getDoublesLeaderboard(data.skip);
	}
}