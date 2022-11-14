import { ClassSerializerInterceptor, Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Conversation, Friendship, PrivateMessage } from "src/typeorm";
import { UserModule } from "src/user/user.module";
import { ConversationController } from "./conversation.controller";
import { ConversationService } from "./conversation.service";
import { PrivateMessageService } from "./message/private-msg.sevice";

@Module({
	imports: [
		UserModule,
		Friendship,
		TypeOrmModule.forFeature([
			Conversation,
			PrivateMessage,
		]),
	],
	controllers: [ ConversationController ],
	providers: [ ConversationService, PrivateMessageService,
		{
			provide: APP_INTERCEPTOR,
			useClass: ClassSerializerInterceptor,
		}],
	exports: [ ConversationService, PrivateMessageService ],
})
export class ConversationModule {}