import { GameSettings, GameType } from "src/utils/types/game.types";

export class SettingsFactory {
	defaultSetting(gameType: GameType): GameSettings {
		if (gameType === GameType.Singles) {
			return {
				is_ranked: true,
				game_type: gameType,
				up_down_border: 20,
				player_back_advance: 20,
				player_front_advance: 60,
				paddle_size_front: 150,
				paddle_size_back: 150,
				paddle_speed: 10,
				ball_start_speed: 5,
				ball_acceleration: 1,
				point_for_victory: 5,
			}
		} else {
			return {
				is_ranked: true,
				game_type: gameType,
				up_down_border: 20,
				player_back_advance: 20,
				player_front_advance: 300,
				paddle_size_front: 70,
				paddle_size_back: 150,
				paddle_speed: 10,
				ball_start_speed: 5,
				ball_acceleration: 1,
				point_for_victory: 5,
			}
		}
	}
}