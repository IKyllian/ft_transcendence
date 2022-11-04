import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { User } from "src/typeorm";
import { MatchmakingLobby } from "src/utils/types/game.types";
import { GameUser } from "../../game-user";
import { Party } from "../party/party";
import { PartyService } from "../party/party.service";

@Injectable()
export class QueueService {
	constructor(
		private partyService: PartyService,
		) {}
		
	private queue1v1 = new Array<Party>();
	private queue2v2 = new Array<Party>();
	private waitingList = new Array<Party>();

	join1v1Queue(user: User) {
		let party = this.partyService.partyJoined.getParty(user.id);
		if (!party)
			party = this.partyService.createParty(user);
		const gameUser = this.partyService.getGameUserInParty(user.id, party.players)
		if (this.queue1v1.find((e) => e.id === party.id)) {
			throw new BadRequestException("Already in queue");
		} else if (party.players.length > 1) {
			throw new BadRequestException("Too many players for this mod");
		}
		if (!gameUser.isLeader) {
			throw new UnauthorizedException("You are not the leader of this party");
		} else {
			party.players[0].isReady = true;
		}
		this.queue1v1.push(party);
		if (this.queue1v1.length > 1) {
			const lobby: MatchmakingLobby = {
				Player_A_Back: this.queue1v1[0].players[0],
				Player_B_Back: this.queue1v1[1].players[0],
				gameMode: party.gameMode,
			};
			this.queue1v1.splice(0, 2);
			console.log('lobby', lobby);
		}
		console.log('queue', this.queue1v1)
	}

	join2v2Queue(user: User) {
		let party = this.partyService.partyJoined.getParty(user.id);
		if (!party)
			party = this.partyService.createParty(user);
		const gameUser = this.partyService.getGameUserInParty(user.id, party.players)
		//check if ready
		if (this.queue2v2.find((e) => e.id === party.id)) {
			throw new BadRequestException("Already in queue");
		} else if (party.players.length > 2) {
			throw new BadRequestException("Too many players for this mod");
		}
		if (!gameUser.isLeader) {
			throw new UnauthorizedException("You are not the leader of this party");
		} else {
			party.players[0].isReady = true;
		}

		if (party.players.length === 1) {
			if (this.waitingList.length > 0) {
				party.players[1] = this.waitingList[0].players[0];
				this.waitingList.shift();
				this.queue2v2.push(party)
			} else {
				this.waitingList.push(party);
			}
		} else {
			this.queue2v2.push(party);
		}

		if (this.queue2v2.length > 1) {
			const lobby: MatchmakingLobby = {
				Player_A_Back: this.queue2v2[0].players[0],
				Player_A_Front: this.queue2v2[0].players[1],
				Player_B_Back: this.queue2v2[1].players[0],
				Player_B_Front: this.queue2v2[1].players[1],
				gameMode: party.gameMode,
			};
			this.queue2v2.splice(0, 2);
			console.log('lobby', lobby);
		}
	}
}