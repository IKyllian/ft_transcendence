import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { Interval, SchedulerRegistry, Timeout } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { CronJob } from "cron";
import { NotificationService } from "src/notification/notification.service";
import { Notification } from "src/typeorm";
import { notificationType } from "src/utils/types/types";
import { Repository } from "typeorm";

@Injectable()
export class TaskService {
	constructor(
		private schedulerRegistry: SchedulerRegistry,
		// @Inject(forwardRef(() => NotificationService))
		// private notifService: NotificationService,

		@InjectRepository(Notification)
		private notifRepo: Repository<Notification>,
	) {}

	getCronJob() {
		return this.schedulerRegistry.getCronJobs();
	}

	// handlePartyInviteNotiff(notif: Notification) {
	// 	const date = new Date(Date.now() + 20 * 1000);
	// 	const job = new CronJob(date, async () => {
	// 		await this.notifService.delete(notif.id);
	// 		this.schedulerRegistry.deleteCronJob("channel-msg-notif-" + notif.id);
	// 	});
	// 	this.schedulerRegistry.addCronJob("channel-msg-notif-" + notif.id, job);
	// 	job.start();
	// }

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