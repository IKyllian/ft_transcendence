import { User } from "src/typeorm";
import { PlayerPosition, PlayerType, TeamSide } from "src/utils/types/game.types";

export class Player {
	constructor(
		public user: User,
	) {
		this.isReady = false;
		this.isLeader = false;
		this.team = TeamSide.BLUE;
		this.pos = PlayerPosition.BACK;
	}
	isReady: boolean;
	isLeader: boolean;
	pos: PlayerPosition;
	team: TeamSide;

}