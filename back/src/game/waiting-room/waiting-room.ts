import { Socket } from "socket.io";
import { User } from "src/typeorm";
import { GameSettings, PlayerType } from "src/utils/types/game.types";

export class WaitingRoom {

	// ownerId: number;
	constructor(private owner: User)
	{
	}

	gameSetting: GameSettings;

	// users: Array<GameUser> = new Array();
}