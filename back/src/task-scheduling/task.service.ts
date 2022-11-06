import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { Interval, SchedulerRegistry, Timeout } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { CronJob } from "cron";
import { exit } from "process";
import { Server } from "socket.io";
import { MatchmakingLobby } from "src/game/matchmaking/matchmakingLobby";
import { QueueService } from "src/game/matchmaking/queue/queue.service";
import { ChannelUser, Notification, UserTimeout } from "src/typeorm";
import { GameMode } from "src/utils/types/game.types";
import { ChannelUpdateType, EloRange, notificationType, QueueLobbby } from "src/utils/types/types";
import { Repository } from "typeorm";

@Injectable()
export class TaskService {
	constructor(
		private schedulerRegistry: SchedulerRegistry,
		private queueService: QueueService,

		@InjectRepository(Notification)
		private notifRepo: Repository<Notification>,
		@InjectRepository(UserTimeout)
		private timeoutRepo: Repository<UserTimeout>,
		@InjectRepository(ChannelUser)
		private chanUserRepo: Repository<ChannelUser>,
	) {}

	server: Server;

	getCronJob() {
		return this.schedulerRegistry.getCronJobs();
	}

	setServerRange(nbQueueing: number): EloRange {
		if (nbQueueing >= 0 && nbQueueing < 5) {
			return {
				low: 75,
				mid: 125,
				hight: 250,
				max: 6666,
			}
		} else if (nbQueueing >= 5 && nbQueueing < 20) {
			return {
				low: 75,
				mid: 125,
				hight: 250,
				max: 6666,
			}
		} else {
			return {
				low: 25,
				mid: 75,
				hight: 125,
				max: 6666,
			}
		}
	}

	adjustLobbyEloRange(queue: QueueLobbby[], serverRange: EloRange) {
		queue.forEach((party) => {
			const timeInQueue: number = (Date.now() - party.timeInQueue) / 1000;
			console.log(timeInQueue, this.queueService.queue1v1.length);
			if (timeInQueue > 120)
				party.range = serverRange.max;
			else if (timeInQueue > 60)
				party.range = serverRange.hight;
			else if (timeInQueue > 30)
				party.range = serverRange.mid;
			else
				party.range = serverRange.low;
		});
	}

	@Interval('singles-queue', 3000)
	async handleSinglesQueue() {
		let matchFound: MatchmakingLobby[] = [];
		this.queueService.queue1v1.sort((a, b) => a.averageMmr - b.averageMmr);
		const range: EloRange = this.setServerRange(this.queueService.queue1v1.length);
		this.adjustLobbyEloRange(this.queueService.queue1v1, range);
		for (let i: number = 0; i < this.queueService.queue1v1.length; ++i) {
			for (let j: number = i + 1; j < this.queueService.queue1v1.length; ++j) {
				const mmrDiff = Math.abs(this.queueService.queue1v1[i].averageMmr - this.queueService.queue1v1[j].averageMmr);
				if (i !== j && mmrDiff <= this.queueService.queue1v1[i].range
				&& mmrDiff <= this.queueService.queue1v1[j].range) {

					matchFound.push(new MatchmakingLobby(this.queueService.queue1v1[i], this.queueService.queue1v1[j], GameMode.OneVsOne));

					this.queueService.queue1v1 = this.queueService.queue1v1.filter((party) => 
					party.id !== this.queueService.queue1v1[i].id && party.id !== this.queueService.queue1v1[j].id);
					console.log("GAME FOUND")
				}
			}
		}
		// console.log("MatchFound: ", matchFound);
	}

	@Interval('doubles-queue', 30000)
	async handleDoublesQueue() {
		// TODO sort by elo?
		let matchFound: MatchmakingLobby[] = [];
		let potentialLobby: QueueLobbby[] = [];
		this.queueService.queue2v2.sort((a, b) => a.averageMmr - b.averageMmr);
		const range: EloRange = this.setServerRange(this.queueService.queue2v2.length);
		this.adjustLobbyEloRange(this.queueService.queue2v2, range);
		for (let i: number = 0; i < this.queueService.queue2v2.length; ++i) {
			let lobby: QueueLobbby = JSON.parse(JSON.stringify(this.queueService.queue2v2[i]));
			potentialLobby.push(lobby);
			for (let j: number = 0; j < this.queueService.queue2v2.length; ++j) {
				const mmrDiff = Math.abs(lobby.averageMmr - this.queueService.queue2v2[j].averageMmr);
				if (i !== j && mmrDiff <= this.queueService.queue2v2[i].range
				&& mmrDiff <= this.queueService.queue2v2[j].range) {
					if (this.queueService.queue2v2[j].players.length === 1) {
						let match: boolean = false;
						potentialLobby.forEach((solo) => {
							if (solo.players.length === 1) {
								solo.players.push(this.queueService.queue2v2[j].players[0]);
								solo.averageMmr = (solo.averageMmr + this.queueService.queue2v2[j].averageMmr) / 2;
								match = true;
							}
						});
						if (!match) {
							let soloLobby: QueueLobbby = JSON.parse(JSON.stringify(this.queueService.queue2v2[i]));
							potentialLobby.push(soloLobby);
						}
					} else if (this.queueService.queue2v2[j].players.length > 1) {
						potentialLobby.push(this.queueService.queue2v2[j]);
					}
					if (potentialLobby.length > 1 && potentialLobby[1].players.length > 1) {
						potentialLobby.forEach((lobby) => {
							lobby.players.forEach((player) => this.queueService.leaveQueue(player.user));
						})
						console.log("GAME FOUND")
						matchFound.push(new MatchmakingLobby(potentialLobby[0], potentialLobby[1], GameMode.TwoVsTwo));
					}
				}
			}
			potentialLobby = [];
		}
		// matchFound.forEach((match) => ) // call game Karim function to create game
		console.log("MatchFound: ", matchFound);
	}

	@Interval('timedout-user', 30000)
	async handleTimedoutUser() {
		const users = await this.timeoutRepo
			.createQueryBuilder('timeout')
			.where("timeout.until < :now", { now: new Date() })
			.getMany();

		if (users) {
			users.forEach(async (timeout) => {
				await this.timeoutRepo.delete(timeout.id);
				this.server.to(`channel-${timeout.channelId}`).emit('ChannelUpdate', { type: ChannelUpdateType.TIMEOUT, data: timeout });
			});
		}
	}

	@Interval('party-notifications', 10000)
	async handlePartyInviteNotif() {
		await this.notifRepo
			.createQueryBuilder()
			.delete()
			.from(Notification)
			.where("type = :type", { type: notificationType.PARTY_INVITE })
			.andWhere("delete_at < :now", { now: new Date() })
			.execute();
	}
}