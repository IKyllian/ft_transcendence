import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChannelModule } from "src/chat/channel/channel.module";
import { ChatGateway } from "src/chat/gateway/chat.gateway";
import { MatchmakingModule } from "src/game/matchmaking/matchmaking.module";
import { ChannelUser, Notification, UserTimeout } from "src/typeorm";
import { TaskService } from "./task.service";

@Module({
	imports: [
		// forwardRef(() => ChatGateway),
		// ChatGateway,
		ChannelModule,
		// forwardRef(() => ChannelModule),
		TypeOrmModule.forFeature([
			Notification,
			UserTimeout,
			ChannelUser,
		])
	],
	providers: [ TaskService ],
	exports: [ TaskService ],

})
export class TaskScheduler {}