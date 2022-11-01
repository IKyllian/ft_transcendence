import { Injectable } from "@nestjs/common";
import { User } from "src/typeorm";

@Injectable()
export class UserSessionManager {
	private readonly sessions: Map<number, User> = new Map();

	getUser(id: number) {
		return this.sessions.get(id);
	}

	setUser(id: number, user: User) {
		this.sessions.set(id, user);
	}
	
	removeUser(id: number) {
		this.sessions.delete(id);
	}
}