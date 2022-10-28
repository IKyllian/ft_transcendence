import { Injectable } from "@nestjs/common";
import { GameUser } from "./game-user.interface";

@Injectable()
export class GameUserSessionManager {
	private readonly sessions: Map<number, GameUser> = new Map();

	getGameUser(id: number) {
		return this.sessions.get(id);
	}

	setGameUser(id: number, gameUser: GameUser) {
		this.sessions.set(id, gameUser);
	}
	
	removeGameUser(id: number) {
		this.sessions.delete(id);
	}
}