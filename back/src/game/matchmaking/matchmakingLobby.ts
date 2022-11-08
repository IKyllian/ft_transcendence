import { GameSettings, GameType, PlayerPosition, TeamSide } from "src/utils/types/game.types";
import { QueueLobbby } from "src/utils/types/types";
import { Player } from "../player";

export class MatchmakingLobby {
	constructor(blueTeam: QueueLobbby, redTeam: QueueLobbby, public game_settings: GameSettings) {
		this.players = [];
		if (game_settings.is_ranked) {
			blueTeam.players[0].pos = PlayerPosition.BACK;
			blueTeam.players[0].team = TeamSide.BLUE;
			redTeam.players[0].pos = PlayerPosition.BACK;
			redTeam.players[0].team = TeamSide.RED;
			this.players.push(blueTeam.players[0]);
			this.players.push(redTeam.players[0]);
			if (this.game_settings.game_type === GameType.Doubles) {
				blueTeam.players[1].pos = PlayerPosition.FRONT;
				blueTeam.players[1].team = TeamSide.BLUE;
				redTeam.players[1].pos = PlayerPosition.FRONT;
				redTeam.players[1].team = TeamSide.RED;
				this.players.push(blueTeam.players[1]);
				this.players.push(redTeam.players[1]);
			}
		}
		// if (this.game_settings.game_type === GameType.Singles) {
		// 	this.Player_A_Back = blueTeam.players[0];
		// 	this.Player_B_Back = redTeam.players[0];
		// } else {
		// 	if (blueTeam.players[0].pos === PlayerPosition.BACK) {
		// 		this.Player_A_Back = blueTeam.players[0];
		// 		this.Player_A_Front = blueTeam.players[1];
		// 	} else {
		// 		this.Player_A_Back = blueTeam.players[1];
		// 		this.Player_A_Front = blueTeam.players[0];
		// 	}
		// 	if (redTeam.players[0].pos === PlayerPosition.BACK) {
		// 		this.Player_B_Back = redTeam.players[0];
		// 		this.Player_B_Front = redTeam.players[1];
		// 	} else {
		// 		this.Player_B_Back = redTeam.players[1];
		// 		this.Player_B_Front = redTeam.players[0];
		// 	}
		// }
	}

	players: Player[];

	// Player_A_Back: Player;
	// Player_A_Front: Player;
	// Player_B_Back: Player;
	// Player_B_Front: Player;
}