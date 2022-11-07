import { Injectable, NotFoundException } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { User } from "src/typeorm";
import { GameUser } from "../../game-user";
import { PartyJoinedSessionManager } from "./party.session";
import { Party } from "./party";
import { GlobalService } from "src/utils/global/global.service";

@Injectable()
export class PartyService {
	constructor(
		public partyJoined: PartyJoinedSessionManager,
		private globalService: GlobalService,
	) {}

	getGameUserInParty(id: number, gameUser: GameUser[]) {
		return gameUser.find((e) => e.user.id === id);
	}

	emitPartyUpdate(party: Party) {
		party.players.forEach((player) => {
			this.globalService.server.to(`user-${player.user.id}`).emit('PartyUpdate', party);
		})
	}

	createParty(user: User) {
		delete user.blocked;
		delete user.channelUser;
		this.partyJoined.setParty(user.id, new Party(user));
		return this.partyJoined.getParty(user.id);
	}

	joinParty(user: User, requesterId: number) {
		delete user.blocked;
		delete user.channelUser;
		this.leaveParty(user);
		const party = this.partyJoined.getParty(requesterId);
		if (!party) { throw new NotFoundException('party not found'); }
		party.join(user);
		this.partyJoined.setParty(user.id, party);
		this.emitPartyUpdate(party);
	}

	leaveParty(user: User) {
		const party = this.partyJoined.getParty(user.id);
		if (party) {
			const gameUser = this.getGameUserInParty(user.id, party.players);
			if (gameUser && gameUser.isLeader && party.players.length > 1) {
				party.players[1].isLeader = true;
				party.players.forEach((player) => player.isReady = false);
			}
			party.leave(user);
			this.partyJoined.removeParty(user.id);
			this.emitPartyUpdate(party);
			this.globalService.server.to(`user-${user.id}`).emit('PartyLeave');
		}
	}

	kickFromParty(user: User, id: number) {
		const party = this.partyJoined.getParty(user.id);
		if (party && this.getGameUserInParty(user.id, party.players).isLeader) {
			this.leaveParty(this.getGameUserInParty(id, party.players).user);
		}
	}

	setReadyState(user: User, isReady: boolean) {
		let party = this.partyJoined.getParty(user.id);
		if (party) {
			const gameUser = this.getGameUserInParty(user.id, party.players);
			if (gameUser) {
				gameUser.isReady = isReady;
				this.emitPartyUpdate(party);
			}
		}
	}

}