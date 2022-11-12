import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { User } from "src/typeorm";
import { GlobalService } from "src/utils/global/global.service";
import { GameType, PlayerPosition } from "src/utils/types/game.types";
import { QueueLobby } from "src/utils/types/types";
import { Player } from "../../player";
import { Party } from "../party/party";
import { PartyService } from "../party/party.service";
import { InQueueSessionManager } from "./in-queue.session";

@Injectable()
export class QueueService {
	constructor(
		private partyService: PartyService,
		private globalService: GlobalService,
		private inQueueSession: InQueueSessionManager,
	) {}
		
	public queue1v1 = new Array<QueueLobby>();
	public queue2v2 = new Array<QueueLobby>();

	joinQueue(user: User, game_mode: GameType) {
		let queueLobby: QueueLobby = new QueueLobby(game_mode);
		const queue: QueueLobby[] = game_mode === GameType.Singles ? this.queue1v1 : this.queue2v2;
		const nbOfPayersRequired: number = game_mode === GameType.Singles ? 1 : 2;
		const party = this.partyService.partyJoined.getParty(user.id);
		if (!party) {
			queueLobby.addPlayer(new Player(user));
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
			party.players.forEach((player) => queueLobby.addPlayer(player));
		}
		if (queue.find((e) => e.id === queueLobby.id)) {
			throw new BadRequestException("Already in queue");
		}
		queueLobby.players.forEach((player) => {
			this.globalService.server.to(`user-${player.user.id}`).emit('InQueue', true);
		});
		this.inQueueSession.setInQueue(user.id, queueLobby);
		queueLobby.timeInQueue = Date.now();
		queue.push(queueLobby);
	}

	leaveQueue(user: User) {
		const party = this.partyService.partyJoined.getParty(user.id);
		if (party) {
			const inQueue: QueueLobby = this.inQueueSession.getInQueue(party.players[0].user.id);
			if (inQueue) {
				if (inQueue.game_type === GameType.Singles) {
					this.queue1v1 = this.queue1v1.filter((queueing) => queueing.id !== inQueue.id);
				} else {
					this.queue2v2 = this.queue1v1.filter((queueing) => queueing.id !== inQueue.id);
				}
				this.inQueueSession.removeInQueue(party.players[0].user.id);
			}
			party.players.forEach(player => player.isReady = false);
			this.partyService.emitPartyUpdate(party, true);
		} else {
			const inQueue: QueueLobby = this.inQueueSession.getInQueue(user.id);
			if (inQueue) {
				if (inQueue.game_type === GameType.Singles) {
					this.queue1v1 = this.queue1v1.filter((queueing) => queueing.id !== inQueue.id);
				} else {
					this.queue2v2 = this.queue1v1.filter((queueing) => queueing.id !== inQueue.id);
				}
				this.inQueueSession.removeInQueue(user.id);
				this.globalService.server.to('user-' + user.id).emit('InQueue', false);
			}
		}
	}
}