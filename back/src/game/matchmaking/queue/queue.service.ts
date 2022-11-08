import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { User } from "src/typeorm";
import { GlobalService } from "src/utils/global/global.service";
import { GameType } from "src/utils/types/game.types";
import { QueueLobbby } from "src/utils/types/types";
import { Player } from "../../player";
import { PartyService } from "../party/party.service";

@Injectable()
export class QueueService {
	constructor(
		private partyService: PartyService,
		private globalService: GlobalService,
	) {}
		
	public queue1v1 = new Array<QueueLobbby>();
	public queue2v2 = new Array<QueueLobbby>();

	// join1v1Queue(user: User) {
	// 	let queueLobby: QueueLobbby
	// 	let party = this.partyService.partyJoined.getParty(user.id);
	// 	if (!party) {
	// 		queueLobby = { id: "queue-" + user.id, players: [ new Player(user) ]};
	// 	} else {
	// 		if (party.players.length > 1) {
	// 			throw new BadRequestException("Too many players for this mode");
	// 		}
	// 		const player = this.partyService.getPlayerInParty(user.id, party.players)
	// 		if (!player.isLeader) {
	// 			throw new UnauthorizedException("You are not the leader of this party");
	// 		}
	// 		queueLobby = party;
	// 	}
	// 	if (this.queue1v1.find((e) => e.id === queueLobby.id)) {
	// 		throw new BadRequestException("Already in queue");
	// 	}
	// 	queueLobby.timeInQueue = Date.now();
	// 	queueLobby.averageMmr = user.singlesElo;
	// 	this.queue1v1.push(queueLobby);
	// 	this.globalService.server.to(`user-${user.id}`).emit('InQueue', true);
	// 	console.log("nb of player in queue", this.queue1v1.length)
	// }

	joinQueue(user: User, game_mode: GameType) {
		let queueLobby: QueueLobbby;
		const queue: QueueLobbby[] = game_mode === GameType.Singles ? this.queue1v1 : this.queue2v2;
		const maxPlayers: number = game_mode === GameType.Singles ? 1 : 2;
		const party = this.partyService.partyJoined.getParty(user.id);
		if (!party) {
			queueLobby = { id: "queue-" + user.id, players: [ new Player(user) ]};
		} else {
			if (party.players.length > maxPlayers) {
				throw new BadRequestException("Too many players for this mode");
			}
			const player = this.partyService.getPlayerInParty(user.id, party.players)
			if (!player.isLeader) {
				throw new UnauthorizedException("You are not the leader of this party");
			}
			queueLobby = party;
		}
		if (queue.find((e) => e.id === queueLobby.id)) {
			throw new BadRequestException("Already in queue");
		}
		queueLobby.averageMmr = 0;
		queueLobby.players.forEach((player) => {
			queueLobby.averageMmr += player.user.doublesElo
			this.globalService.server.to(`user-${player.user.id}`).emit('InQueue', true);
		});
		queueLobby.averageMmr /= queueLobby.players.length;
		queueLobby.timeInQueue = Date.now();
		queue.push(queueLobby);
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
			this.globalService.server.to('user-' + user.id).emit('InQueue', false);
			this.queue1v1 = this.queue1v1.filter((queueing) => queueing.id !== "queue-" + user.id);
			this.queue2v2 = this.queue2v2.filter((queueing) => queueing.id !== "queue-" + user.id)
		}
	}
}