import { Socket } from "socket.io";
import { User } from "src/typeorm";
import { GameSettings, PlayerType } from "src/utils/types/game.types";

export class GameUser {
	user: User;
	socket: Socket;
	isReady: boolean;
	pos?: PlayerType;
}

export class WaitingRoom {

	// ownerId: number;
	constructor(ownerId: number)
	{

	}

	gameSetting: GameSettings;

	users: Array<GameUser> = new Array();
}