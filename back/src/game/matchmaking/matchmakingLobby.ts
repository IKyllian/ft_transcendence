import { GameSettings, GameType, PlayerPosition } from "src/utils/types/game.types";
import { QueueLobbby } from "src/utils/types/types";
import { GameUser } from "../game-user";

export class MatchmakingLobby {
	constructor(lobby1: QueueLobbby, lobby2: QueueLobbby, private gameSettings: GameSettings) {
		if (this.gameSettings.game_type === GameType.Doubles) {
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