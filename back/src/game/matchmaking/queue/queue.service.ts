import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { User } from "src/typeorm";
import { GlobalService } from "src/utils/global/global.service";
import { QueueLobbby } from "src/utils/types/types";
import { GameUser } from "../../game-user";
import { PartyService } from "../party/party.service";

@Injectable()
export class QueueService {
	constructor(
		private partyService: PartyService,
		private globalService: GlobalService,
	) {}
		
	public queue1v1 = new Array<QueueLobbby>();
	public queue2v2 = new Array<QueueLobbby>();
	private waitingList = new Array<QueueLobbby>();

	join1v1Queue(user: User) {
		let queueLobby: QueueLobbby
		let party = this.partyService.partyJoined.getParty(user.id);
		if (!party) {
			queueLobby = { id: "queue-" + user.id, players: [ new GameUser(user) ]};
		} else {
			if (party.players.length > 1) {
				throw new BadRequestException("Too many players for this mode");
			}
			const gameUser = this.partyService.getGameUserInParty(user.id, party.players)
			if (!gameUser.isLeader) {
				throw new UnauthorizedException("You are not the leader of this party");
			}
			queueLobby = party;
		}
		if (this.queue1v1.find((e) => e.id === queueLobby.id)) {
			throw new BadRequestException("Already in queue");
		}
		queueLobby.timeInQueue = Date.now();
		queueLobby.averageMmr = user.singlesElo;
		this.queue1v1.push(queueLobby);
		this.globalService.server.to(`user-${user.id}`).emit('InQueue', true);
		console.log("nb of player in queue", this.queue1v1.length)
	}

	join2v2Queue(user: User) {
		let queueLobby: QueueLobbby
		let party = this.partyService.partyJoined.getParty(user.id);
		if (!party) {
			queueLobby = { id: "queue-" + user.id, players: [ new GameUser(user) ]};
		} else {
			if (party.players.length > 1) {
				throw new BadRequestException("Too many players for this mode");
			}
			const gameUser = this.partyService.getGameUserInParty(user.id, party.players)
			if (!gameUser.isLeader) {
				throw new UnauthorizedException("You are not the leader of this party");
			}
			queueLobby = party;
		}
		if (this.queue2v2.find((e) => e.id === queueLobby.id)) {
			throw new BadRequestException("Already in queue");
		}
		queueLobby.timeInQueue = Date.now();
		queueLobby.averageMmr = 0;
		queueLobby.players.forEach((player) => {
		queueLobby.averageMmr += player.user.doublesElo
		this.globalService.server.to(`user-${player.user.id}`).emit('InQueue', true);
		});
			
		queueLobby.averageMmr /= queueLobby.players.length;
		this.queue2v2.push(queueLobby);
		// console.log("nb of player in queue", this.queue2v2.length);

		// if (party.players.length === 1) {
		// 	if (this.waitingList.length > 0) {
		// 		party.players[1] = this.waitingList[0].players[0];
		// 		this.waitingList.shift();
		// 		this.queue2v2.push(party)
		// 	} else {
		// 		this.waitingList.push(party);
		// 	}
		// } else {
		// 	this.queue2v2.push(party);
		// }

		// if (this.queue2v2.length > 1) {
		// 	const lobby: MatchmakingLobby = {
		// 		Player_A_Back: this.queue2v2[0].players[0],
		// 		Player_A_Front: this.queue2v2[0].players[1],
		// 		Player_B_Back: this.queue2v2[1].players[0],
		// 		Player_B_Front: this.queue2v2[1].players[1],
		// 		gameMode: party.gameMode,
		// 	};
		// 	this.queue2v2.splice(0, 2);
		// 	console.log('lobby', lobby);
		// }
	}

	leaveQueue(user: User) {
		console.log("leaving")
		const party = this.partyService.partyJoined.getParty(user.id);
		if (party) {
			this.queue1v1 = this.queue1v1.filter((queueing) => queueing.id !== party.id);
			this.queue2v2 = this.queue2v2.filter((queueing) => queueing.id !== party.id);
			party.players.forEach(player => player.isReady = false);
			this.partyService.emitPartyUpdate(party, true);
		} else {
			console.log("leave")
			//TODO cancel for each queue lobby players
			this.globalService.server.to('user-' + user.id).emit('InQueue', false);
			this.queue1v1 = this.queue1v1.filter((queueing) => queueing.id !== "queue-" + user.id);
			this.queue2v2 = this.queue2v2.filter((queueing) => queueing.id !== "queue-" + user.id)
		}
	}
}