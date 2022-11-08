import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtGuard } from "src/auth/guard/jwt.guard";
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
}