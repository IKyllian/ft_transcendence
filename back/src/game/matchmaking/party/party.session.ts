import { Injectable } from "@nestjs/common";
import { Party } from "../party/party";

@Injectable()
export class PartyJoinedSessionManager {
	private readonly sessions: Map<number, Party> = new Map();

	// id = user id
	getParty(id: number) {
		return this.sessions.get(id);
	}

	setParty(id: number, party: Party) {
		this.sessions.set(id, party);
	}
	
	removeParty(id: number) {
		this.sessions.delete(id);
	}
}