import { Injectable } from "@nestjs/common";
import { User } from "src/typeorm";
import { UserSessionManager } from "./user.session";

@Injectable()
export class GameService {
	constructor(
		private userSession: UserSessionManager,
	) {}

	isPlaying(userId: number) : boolean {
		return this.userSession.getUser(userId) ? true : false;
	}
}