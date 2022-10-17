import { ClassSerializerInterceptor, forwardRef, Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NotificationModule } from "src/notification/notification.module";
import { BannedUser, Channel, ChannelMessage, ChannelUser } from "src/typeorm";
import { ChatModule } from "../chat.module";
import { ChannelController } from "./channel.controller";
import { ChannelService } from "./channel.service";
import { ChannelMessageController } from "./message/channelMessage.controller";
import { ChannelMessageService } from "./message/ChannelMessage.service";

@Module({
	imports: [
		NotificationModule,
		// forwardRef(() => NotificationModule),
		TypeOrmModule.forFeature([
			Channel,
			ChannelUser,
			ChannelMessage,
			BannedUser,
		])
	],
	providers: [ChannelService, ChannelMessageService,
	{
		provide: APP_INTERCEPTOR,
		useClass: ClassSerializerInterceptor,
	}],
	controllers: [ChannelController, ChannelMessageController],
	exports: [ChannelService, ChannelMessageService],
})
export class ChannelModule {}