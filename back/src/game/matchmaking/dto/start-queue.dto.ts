import { GameType } from "src/utils/types/game.types";

export class StartQueueDto {
	gameType: GameType;
	isRanked: boolean;
}