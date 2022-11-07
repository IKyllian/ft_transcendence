import { BadRequestException } from "@nestjs/common";
import { generate } from "shortid";
import { Socket } from "socket.io";
import { User } from "src/typeorm";
import { GameSettings, GameType, PlayerType } from "src/utils/types/game.types";
import { GameUser } from "../../game-user";

export class Party {

	constructor(leader: User)
	{
		this.id = generate();
		this.players.push(new GameUser(leader));
		this.players[0].isLeader = true;
	}

	id: string;

	players: GameUser[] = new Array<GameUser>();

	gameSetting: GameSettings;

	join(user: User) {
		if (this.players.find((p) => p.user.id === user.id)) {
			throw new BadRequestException("Already in this lobby");
		} else if (this.players.length === 4) {
			throw new BadRequestException("This lobby is full");
		}
		this.players.push(new GameUser(user));
	}

	leave(user: User) {
		this.players = this.players.filter((player) => player.user.id != user.id);
	}
}