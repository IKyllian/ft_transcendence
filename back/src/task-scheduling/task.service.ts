import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { Interval, SchedulerRegistry, Timeout } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { CronJob } from "cron";
import { Server } from "socket.io";
import { ChannelService } from "src/chat/channel/channel.service";
import { BannedUser, ChannelUser, MutedUser, Notification } from "src/typeorm";
import { ChannelUpdateType, notificationType } from "src/utils/types/types";
import { Repository } from "typeorm";

@Injectable()
export class TaskService {
	constructor(
		private schedulerRegistry: SchedulerRegistry,
		private chanService: ChannelService,

		@InjectRepository(Notification)
		private notifRepo: Repository<Notification>,
		@InjectRepository(BannedUser)
		private bannedRepo: Repository<BannedUser>,
		@InjectRepository(MutedUser)
		private mutedRepo: Repository<MutedUser>,
		@InjectRepository(ChannelUser)
		private chanUserRepo: Repository<ChannelUser>,
	) {}

	server: Server;

	getCronJob() {
		return this.schedulerRegistry.getCronJobs();
	}

	@Interval('timedout-user', 30000)
	async handleTimedoutUser() {
		const userToUnban = await this.bannedRepo
			.createQueryBuilder('banned')
			.where("banned.until < :now", { now: new Date() })
			.getMany();
		if (userToUnban) {
			userToUnban.forEach(async (banned) => {
				await this.bannedRepo.delete(banned.id);
				this.server.to(`channel-${banned.channelId}`).emit('ChannelUpdate', { type: ChannelUpdateType.UNBAN, data: banned });
			});
		}

		const userToUnmute = await this.mutedRepo
			.createQueryBuilder('muted')
			.where("muted.until < :now", { now: new Date() })
			.getMany();
		if (userToUnmute) {
			userToUnmute.forEach(async (muted) => {
				await this.mutedRepo.delete(muted.id);
				const chanUser = await this.chanService.getChannelUser(muted.channelId, muted.userId);
				if (chanUser) {
					chanUser.is_muted = false;
					const updatedChanUser = await this.chanUserRepo.save(chanUser);
					this.server.to(`channel-${muted.channelId}`).emit('ChannelUpdate', { type: ChannelUpdateType.CHANUSER, data: updatedChanUser });
				}
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