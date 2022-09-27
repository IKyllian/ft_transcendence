import { Injectable } from "@nestjs/common";
import { Socket } from "socket.io";

@Injectable()
export class ChatSessionManager {
	private readonly sessions: Map<number, Socket> = new Map();

	getUserSocket(id: number) {
		return this.sessions.get(id);
	}

	setUserSocket(userId: number, socket: Socket) {
		this.sessions.set(userId, socket);
	}
	
	removeUserSocket(userId: number) {
		this.sessions.delete(userId);
	}

	getSockets(): Map<number, Socket> {
		return this.sessions;
	}
}