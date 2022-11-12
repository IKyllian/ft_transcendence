import { Injectable } from "@nestjs/common";
import { User } from "src/typeorm";
import { QueueLobby } from "src/utils/types/types";

@Injectable()
export class InQueueSessionManager {
	private readonly sessions: Map<number, QueueLobby> = new Map();

	getInQueue(id: number): QueueLobby {
		return this.sessions.get(id);
	}

	setInQueue(id: number, queue: QueueLobby) {
		this.sessions.set(id, queue);
	}
	
	removeInQueue(id: number) {
		this.sessions.delete(id);
	}
}