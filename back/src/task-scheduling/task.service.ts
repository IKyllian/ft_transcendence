import { Injectable } from "@nestjs/common";
import { Interval, SchedulerRegistry } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { LobbyFactory } from "src/game/lobby/lobby.factory";
import { MatchmakingLobby } from "src/game/matchmaking/matchmakingLobby";
import { QueueService } from "src/game/matchmaking/queue/queue.service";
import { SettingsFactory } from "src/game/settings.factory";
import { Notification, UserTimeout } from "src/typeorm";
import { GlobalService } from "src/utils/global/global.service";
import { GameType } from "src/utils/types/game.types";
import { ChannelUpdateType, EloRange, notificationType, QueueLobby } from "src/utils/types/types";
import { Repository } from "typeorm";

@Injectable()
export class TaskService {
	constructor(
		private schedulerRegistry: SchedulerRegistry,
		private queueService: QueueService,
		private globalService: GlobalService,
		private lobbyFactory: LobbyFactory,

		@InjectRepository(Notification)
		private notifRepo: Repository<Notification>,
		@InjectRepository(UserTimeout)
		private timeoutRepo: Repository<UserTimeout>,
	) {};

	getCronJob() {
		return this.schedulerRegistry.getCronJobs();
	}

	setServerRange(nbQueueing: number): EloRange {
		if (nbQueueing >= 0 && nbQueueing < 5) {
			return {
				low: 125,
				mid: 175,
				hight: 300,
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

	adjustLobbyEloRange(queue: QueueLobby[], serverRange: EloRange) {
		queue.forEach((party) => {
			const timeInQueue: number = (Date.now() - party.timeInQueue) / 1000;
			// console.log(timeInQueue, this.queueService.queue1v1.length);
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
		// console.log("nb of players in 1v1 queue: " + this.queueService.queue1v1.length);
		if (this.queueService.queue1v1.length < 2) { return; }
		let matchFound: MatchmakingLobby[] = [];
		this.queueService.queue1v1.sort((a, b) => a.averageMmr - b.averageMmr);
		const range: EloRange = this.setServerRange(this.queueService.queue1v1.length);
		this.adjustLobbyEloRange(this.queueService.queue1v1, range);
		for (let i: number = 0; i < this.queueService.queue1v1.length; ++i) {
			for (let j: number = i + 1; j < this.queueService.queue1v1.length; ++j) {
				const mmrDiff = Math.abs(this.queueService.queue1v1[i].averageMmr - this.queueService.queue1v1[j].averageMmr);
				if (i !== j && mmrDiff <= this.queueService.queue1v1[i].range
				&& mmrDiff <= this.queueService.queue1v1[j].range) {

					matchFound.push(new MatchmakingLobby(this.queueService.queue1v1[i], this.queueService.queue1v1[j], new SettingsFactory().defaultSetting(GameType.Singles)));
					this.queueService.queue1v1 = this.queueService.queue1v1.filter((party) => 
					party.id !== this.queueService.queue1v1[i].id && party.id !== this.queueService.queue1v1[j].id);
					console.log("GAME FOUND")
				}
			}
		}
		matchFound.forEach((match) => this.lobbyFactory.lobby_create(match));
	}

	@Interval('doubles-queue', 3000)
	async handleDoublesQueue() {
		if (this.queueService.queue2v2.length < 2) { return; }
		let matchesFound: MatchmakingLobby[] = [];
		let potentialLobby: QueueLobby[] = [];
		let matchFound: boolean;

		this.queueService.queue2v2.sort((a, b) => a.averageMmr - b.averageMmr);
		const range: EloRange = this.setServerRange(this.queueService.queue2v2.length);
		this.adjustLobbyEloRange(this.queueService.queue2v2, range);
		for (let i: number = 0; i < this.queueService.queue2v2.length; ++i) {
			matchFound = false;
			let lobby: QueueLobby;
			if (this.queueService.queue2v2[i].players.length < 2) {
				lobby = new QueueLobby(GameType.Doubles);
				lobby.addPlayer(this.queueService.queue2v2[i].players[0])
			} else {
				lobby = this.queueService.queue2v2[i];
			}
			potentialLobby = [lobby];
			for (let j: number = 0; j < this.queueService.queue2v2.length; ++j) {
				const mmrDiff = Math.abs(lobby.averageMmr - this.queueService.queue2v2[j].averageMmr);
				if (i !== j && mmrDiff <= this.queueService.queue2v2[i].range
				&& mmrDiff <= this.queueService.queue2v2[j].range) {
					if (this.queueService.queue2v2[j].players.length === 1) {
						let pair: boolean = false;
						potentialLobby.forEach((solo) => {
							if (solo.players.length === 1) {
								solo.addPlayer(this.queueService.queue2v2[j].players[0]);
								pair = true;
							}
						});
						if (!pair) {
							let soloLobby = new QueueLobby(GameType.Doubles);
							soloLobby.addPlayer(this.queueService.queue2v2[j].players[0]);
							potentialLobby.push(soloLobby);
						}
					} else {
						potentialLobby.push(this.queueService.queue2v2[j]);
					}
					if (potentialLobby.length > 1 && potentialLobby[0].players.length === 2) {
						for (const lobby of potentialLobby) {
							// console.log('potential lobby', lobby)
							if (lobby.id !== potentialLobby[0].id && lobby.players.length === 2) {
								lobby.players.forEach((player) => this.queueService.leaveQueue(player.user));
								potentialLobby[0].players.forEach((player) => this.queueService.leaveQueue(player.user));
								this.lobbyFactory.lobby_create(new MatchmakingLobby(potentialLobby[0], lobby, new SettingsFactory().defaultSetting(GameType.Doubles)));
								console.log("GAME FOUND")
								break;
							}
						}
					}
				}
			}
		}
	}

	@Interval('timedout-user', 30000)
	async handleTimedoutUser() {
		const users = await this.timeoutRepo
			.createQueryBuilder('timeout')
			.where("timeout.until < :now", { now: new Date() })
			.getMany();

		if (users.length > 0) {
			users.forEach(async (timeout) => {
				await this.timeoutRepo.delete(timeout.id);
				this.globalService.server.to(`channel-${timeout.channelId}`).emit('ChannelUpdate', { type: ChannelUpdateType.UNTIMEOUT, data: timeout.id });
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