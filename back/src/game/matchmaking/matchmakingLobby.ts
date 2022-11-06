import { GameMode, GameSettings, PlayerPosition, PlayerType } from "src/utils/types/game.types";
import { QueueLobbby } from "src/utils/types/types";
import { GameUser } from "../game-user";

// up_down_border: number = 20;
// player_back_advance: number = 20;
// player_front_advance: number = 60;
// paddle_size_h: number = 150;
// paddle_speed: number = 13;
// ball_start_speed: number = 5;
// ball_acceleration: number = 1;
// point_for_victory: number = 3;

export class MatchmakingLobby {
	constructor(lobby1: QueueLobbby, lobby2: QueueLobbby, private gameMode: GameMode) {
		if (this.gameMode === GameMode.OneVsOne) {
			this.Player_A_Back = lobby1.players[0];
			this.Player_B_Back = lobby1.players[0];
		} else {
			if (lobby1.players[0].position === PlayerPosition.BACK) {
				this.Player_A_Back = lobby1.players[0];
				this.Player_A_Front = lobby1.players[1];
			} else {
				this.Player_A_Back = lobby1.players[1];
				this.Player_A_Front = lobby1.players[0];
			}
			if (lobby2.players[0].position === PlayerPosition.BACK) {
				this.Player_B_Back = lobby2.players[0];
				this.Player_B_Front = lobby2.players[1];
			} else {
				this.Player_B_Back = lobby2.players[1];
				this.Player_B_Front = lobby2.players[0];
			}
		}
	}

	Player_A_Back: GameUser;
	Player_A_Front: GameUser;
	Player_B_Back: GameUser;
	Player_B_Front: GameUser;
}