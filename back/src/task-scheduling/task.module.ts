import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GameModule } from "src/game/game.module";
import { MatchmakingModule } from "src/game/matchmaking/matchmaking.module";
import { ChannelUser, Notification, UserTimeout } from "src/typeorm";
import { TaskService } from "./task.service";

@Module({
	imports: [
		forwardRef(() => MatchmakingModule),
		GameModule,
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