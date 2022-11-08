import { Injectable, NotFoundException } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { User } from "src/typeorm";
import { Player } from "../../player";
import { PartyJoinedSessionManager } from "./party.session";
import { Party } from "./party";
import { GlobalService } from "src/utils/global/global.service";
import { PlayerPosition, TeamSide } from "src/utils/types/game.types";
import { contains } from "class-validator";

@Injectable()
export class PartyService {
	constructor(
		public partyJoined: PartyJoinedSessionManager,
		private globalService: GlobalService,
	) {}

	getPlayerInParty(id: number, player: Player[]) {
		return player.find((e) => e.user.id === id);
	}

	emitPartyUpdate(party: Party, cancelQueue = false) {
		party.players.forEach((player) => {
			this.globalService.server.to(`user-${player.user.id}`).emit('PartyUpdate', { party, cancelQueue });
		})
	}

	createParty(user: User) {
		this.partyJoined.setParty(user.id, new Party(user));
		return this.partyJoined.getParty(user.id);
	}

	joinParty(user: User, requesterId: number) {
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
			const player = this.getPlayerInParty(user.id, party.players);
			if (player && player.isLeader && party.players.length > 1) {
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
		if (party && this.getPlayerInParty(user.id, party.players).isLeader) {
			this.leaveParty(this.getPlayerInParty(id, party.players).user);
		}
	}

	setReadyState(user: User, isReady: boolean) {
		const party = this.partyJoined.getParty(user.id);
		if (party) {
			const player = this.getPlayerInParty(user.id, party.players);
			if (player) {
				player.isReady = isReady;
				this.emitPartyUpdate(party);
			}
		}
	}

	setTeamSide(user: User, teamSide: TeamSide) {
		const party = this.partyJoined.getParty(user.id);
		if (party) {
			const player = this.getPlayerInParty(user.id, party.players);
			if (player) {
				player.team = teamSide;
				this.emitPartyUpdate(party);
			}
		}
	}

	setPlayerPos(user: User, pos: PlayerPosition) {
		const party = this.partyJoined.getParty(user.id);
		if (party) {
			const player = this.getPlayerInParty(user.id, party.players);
			if (player) {
				player.pos = pos;
				this.emitPartyUpdate(party);
			}
		}
	}

}