import { ClassSerializerInterceptor, forwardRef, Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NotificationModule } from "src/notification/notification.module";
import { BannedUser, Channel, ChannelMessage, ChannelUser, MutedUser, User, UserTimeout } from "src/typeorm";
import { UserModule } from "src/user/user.module";
import { ChatModule } from "../chat.module";
import { ChannelController } from "./channel.controller";
import { ChannelService } from "./channel.service";
import { ChannelMessageController } from "./message/channelMessage.controller";
import { ChannelMessageService } from "./message/ChannelMessage.service";

@Module({
	imports: [
		NotificationModule,
		UserModule,
		// forwardRef(() => NotificationModule),
		TypeOrmModule.forFeature([
			Channel,
			ChannelUser,
			ChannelMessage,
			BannedUser,
			User,
			UserTimeout,
			MutedUser,
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