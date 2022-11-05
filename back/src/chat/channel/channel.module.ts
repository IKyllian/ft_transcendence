import { ClassSerializerInterceptor, forwardRef, Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NotificationModule } from "src/notification/notification.module";
import { Channel, ChannelMessage, ChannelUser, User, UserTimeout } from "src/typeorm";
import { UserModule } from "src/user/user.module";
import { ChannelController } from "./channel.controller";
import { ChannelService } from "./channel.service";
import { ChannelMessageController } from "./message/channelMessage.controller";
import { ChannelMessageService } from "./message/ChannelMessage.service";

@Module({
	imports: [
		NotificationModule,
		UserModule,
		TypeOrmModule.forFeature([
			Channel,
			ChannelUser,
			ChannelMessage,
			UserTimeout,
			User,
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