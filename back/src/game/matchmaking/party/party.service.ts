import { Injectable, NotFoundException } from "@nestjs/common";
import { Socket } from "socket.io";
import { User } from "src/typeorm";
import { GameUser } from "../../game-user";
import { PartyJoinedSessionManager } from "./party.session";
import { Party } from "./party";
import { NotFoundError } from "rxjs";

@Injectable()
export class PartyService {
	constructor(
		public partyJoined: PartyJoinedSessionManager,
	) {}

	getGameUserInParty(id: number, gameUser: GameUser[]) {
		return gameUser.find((e) => e.user.id === id);
	}

	createParty(user: User) {
		delete user.blocked;
		delete user.channelUser;
		this.partyJoined.setParty(user.id, new Party(user));
		return this.partyJoined.getParty(user.id);
	}

	joinParty(user: User, socket: Socket, requesterId: number) {
		delete user.blocked;
		delete user.channelUser;
		this.leaveParty(user, socket);
		const party = this.partyJoined.getParty(requesterId);
		if (!party) { throw new NotFoundException('party not found'); }
		party.join(user);
		this.partyJoined.setParty(user.id, party);
		socket.join(`Party-${party.id}`);
		socket.emit('PartyUpdate', party);
		socket.to(`Party-${party.id}`).emit('PartyUpdate', party);
	}

	leaveParty(user: User, socket: Socket) {
		const party = this.partyJoined.getParty(user.id);
		if (party) {
			party.leave(user);
			if (party.leader.id === user.id && party.players.length > 0) {
				party.leader = party.players[0].user;
				party.players.forEach((player) => player.isReady = false);
				socket.emit('PartyUpdate', party);
				socket.to(`Party-${party.id}`).emit('PartyUpdate', party);
			}
			this.partyJoined.removeParty(user.id);
		}
	}

	setReadyState(user: User, socket: Socket, isReady: boolean) {
		let party = this.partyJoined.getParty(user.id);
		if (party) {
			const gameUser = this.getGameUserInParty(user.id, party.players);
			if (gameUser) {
				gameUser.isReady = isReady;
				socket.emit('PartyUpdate', party);
				socket.to(`Party-${party.id}`).emit('PartyUpdate', party);
			}
		}
	}

}