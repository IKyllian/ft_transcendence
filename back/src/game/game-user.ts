import { Socket } from "socket.io";
import { User } from "src/typeorm";
import { PlayerType } from "src/utils/types/game.types";
import { Party } from "./matchmaking/party/party";

export class GameUser {
	constructor(
		public user: User,
	) {
		this.isReady = false;
	}
	isReady: boolean;
	pos?: PlayerType;
}