import { BadRequestException } from "@nestjs/common";
import { generate } from "shortid";
import { Socket } from "socket.io";
import { SettingsFactory } from "src/game/settings.factory";
import { User } from "src/typeorm";
import { GameMode, GameSettings, GameType, PlayerType } from "src/utils/types/game.types";
import { PartyMessage } from "src/utils/types/types";
import { Player } from "../../player";

export class Party {

	constructor(leader: User)
	{
		this.id = generate();
		this.players.push(new Player(leader));
		this.players[0].isLeader = true;
		this.game_settings = new SettingsFactory().defaultSetting(GameType.Singles);
		this.game_mode = GameMode.RANKED;
	}

	id: string;

	players: Player[] = new Array<Player>();

	messages: PartyMessage[] = new Array<PartyMessage>();

	game_settings: GameSettings;

	game_mode: GameMode;

	join(user: User) {
		if (this.players.find((p) => p.user.id === user.id)) {
			throw new BadRequestException("Already in this lobby");
		} else if (this.players.length === 4) {
			throw new BadRequestException("This lobby is full");
		}
		this.players.push(new Player(user));
	}

	leave(user: User) {
		this.players = this.players.filter((player) => player.user.id != user.id);
	}

	createMessage(sender: User, content: string): PartyMessage {
		let message: PartyMessage = {
			sender: sender,
			content: content,
			send_at: new Date(),
		};

		this.messages.push(message);
		return message;
	}
}