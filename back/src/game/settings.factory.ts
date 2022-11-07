import { GameSettings, GameType } from "src/utils/types/game.types";

export class SettingsFactory {
	defaultSetting(gameType: GameType): GameSettings {
		if (gameType === GameType.Singles) {
			return {
				game_type: gameType,
				up_down_border: 20,
				player_back_advance: 20,
				player_front_advance: 60,
				paddle_size_h: 150,
				paddle_speed: 13,
				ball_start_speed: 5,
				ball_acceleration: 1,
				point_for_victory: 3,
			}
		}
	}
}