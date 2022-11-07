import { User } from "src/typeorm";
import { PlayerPosition, PlayerType, TeamSide } from "src/utils/types/game.types";

export class GameUser {
	constructor(
		public user: User,
	) {
		this.isReady = false;
		this.isLeader = false;
	}
	isReady: boolean;
	isLeader: boolean;
	position?: PlayerPosition;
	teamSide?: TeamSide;

}