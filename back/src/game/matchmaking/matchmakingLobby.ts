import { GameSettings, PlayerPosition, TeamSide } from "src/utils/types/game.types";
import { QueueLobby } from "src/utils/types/types";
import { Player } from "../player";

export class MatchmakingLobby {
	constructor(blueTeam: QueueLobby, redTeam: QueueLobby, public game_settings: GameSettings) {
		this.players = [];
		let backTaken: boolean = false;
		blueTeam.players.forEach((player) => {
			player.team = TeamSide.BLUE;
			if (player.pos === PlayerPosition.BACK && !backTaken) {
				backTaken = true;
			} else {
				player.pos = PlayerPosition.FRONT;
			}
			this.players.push(player);
		})
		backTaken = false;
		redTeam.players.forEach((player) => {
			player.team = TeamSide.RED;
			if (player.pos === PlayerPosition.BACK && !backTaken) {
				backTaken = true;
			} else {
				player.pos = PlayerPosition.FRONT;
			}
			this.players.push(player);
		})
	}

	players: Player[];
}