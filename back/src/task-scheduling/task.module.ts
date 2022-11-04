import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NotificationModule } from "src/notification/notification.module";
import { Notification } from "src/typeorm";
import { TaskService } from "./task.service";

@Module({
	imports: [
		// forwardRef(() => NotificationModule),
		TypeOrmModule.forFeature([
			Notification,
		])
	],
	providers: [ TaskService ],
	exports: [ TaskService ],

})
export class TaskScheduler {}