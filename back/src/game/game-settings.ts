import { GameType } from "src/utils/types/game.types"

export class GameSettings {
	game_type: GameType = GameType.Singles;
	up_down_border: number = 20;
	player_back_advance: number = 20;
	player_front_advance: number = 60;
	paddle_size_h: number = 150;
	paddle_speed: number = 13;
	ball_start_speed: number = 5;
	ball_acceleration: number = 1;
	point_for_victory: number = 3;
}