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
	isPlaying(
		@GetUser('id') userId: number,
	) {
		return this.gameService.isPlaying(userId);
	}

	// @UseGuards(JwtGuard)
	// @Get('match_history')
	// async getMatchHistory(
	// 	@GetUser('id') userId: number,
	// ) {
	// 	return await this.gameService.getMatchHistory(userId);
	// }
	@UseGuards(JwtGuard)
	@Post('singles-leaderboard')
	async getSinglesLeaderboard(
		@Body() data: SkipDto,
	) {
		return await this.gameService.getSinglesLeaderboard(data.skip);
	}

	@UseGuards(JwtGuard)
	@Post('doubles-leaderboard')
	async getDoublesLeaderboard(
		@Body() data: SkipDto,
	) {
		return await this.gameService.getDoublesLeaderboard(data.skip);
	}
}