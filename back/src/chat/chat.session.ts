import { Injectable } from "@nestjs/common";
import { Socket } from "socket.io";
import { User } from "src/typeorm";

// @Injectable()
// export class ChatSessionManager {
// 	private readonly sessions: Map<number, Socket> = new Map();

// 	getUserSocket(id: number) {
// 		return this.sessions.get(id);
// 	}

// 	setUserSocket(userId: number, socket: Socket) {
// 		this.sessions.set(userId, socket);
// 	}
	
// 	removeUserSocket(userId: number) {
// 		this.sessions.delete(userId);
// 	}

// 	getSockets(): Map<number, Socket> {
// 		return this.sessions;
// 	}
// }

export type UserSocket = {
	user: User,
	socket: Socket,
};

@Injectable()
export class ChatSessionManager {
	private readonly sessions: Map<string, UserSocket> = new Map();

	getUserSocket(id: string) {
		return this.sessions.get(id);
	}

	setUserSocket(id: string, socket: UserSocket) {
		this.sessions.set(id, socket);
	}
	
	removeUserSocket(id: string) {
		this.sessions.delete(id);
	}

	// getSockets(): Map<number, UserSocket> {
	// 	return this.sessions;
	// }
}