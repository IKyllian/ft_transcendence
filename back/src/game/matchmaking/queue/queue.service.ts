import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { User } from "src/typeorm";
import { GlobalService } from "src/utils/global/global.service";
import { GameType, PlayerPosition } from "src/utils/types/game.types";
import { QueueLobbby } from "src/utils/types/types";
import { Player } from "../../player";
import { Party } from "../party/party";
import { PartyService } from "../party/party.service";

@Injectable()
export class QueueService {
	constructor(
		private partyService: PartyService,
		private globalService: GlobalService,
	) {}
		
	public queue1v1 = new Array<QueueLobbby>();
	public queue2v2 = new Array<QueueLobbby>();

	joinQueue(user: User, game_mode: GameType) {
		let queueLobby: QueueLobbby = new QueueLobbby;
		const queue: QueueLobbby[] = game_mode === GameType.Singles ? this.queue1v1 : this.queue2v2;
		const nbOfPayersRequired: number = game_mode === GameType.Singles ? 1 : 2;
		const party = this.partyService.partyJoined.getParty(user.id);
		if (!party) {
			queueLobby.id = "queue-" + user.id;
			queueLobby.players = [ new Player(user) ];
		} else {
			this.partyService.partyIsReady(party);
			if (party.players.length !== nbOfPayersRequired) {
				throw new BadRequestException("Number of players does not fit this mode");
			} else if (nbOfPayersRequired === 2 && party.players[0].pos === party.players[1].pos) {
				throw new BadRequestException("Team can't be at the same position");
			} else if (nbOfPayersRequired === 1 && party.players[0].pos !== PlayerPosition.BACK) {
				throw new BadRequestException("Player must be at Back position");
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
			queueLobby.averageMmr += game_mode === GameType.Singles ? player.user.singles_elo : player.user.doubles_elo
			this.globalService.server.to(`user-${player.user.id}`).emit('InQueue', true);
		});
		queueLobby.averageMmr /= queueLobby.players.length;
		queueLobby.timeInQueue = Date.now();
		queue.push(queueLobby);
	}

	leaveQueue(user: User) {
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