import { GameSettings, GameType, PlayerPosition, TeamSide } from "src/utils/types/game.types";
import { QueueLobbby } from "src/utils/types/types";
import { Player } from "../player";

export class MatchmakingLobby {
	constructor(blueTeam: QueueLobbby, redTeam: QueueLobbby, public game_settings: GameSettings) {
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