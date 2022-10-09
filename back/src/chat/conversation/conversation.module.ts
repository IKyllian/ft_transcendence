import { ClassSerializerInterceptor, Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Conversation, PrivateMessage } from "src/typeorm";
import { UserModule } from "src/user/user.module";
import { ConversationService } from "./conversation.service";
import { PrivateMessageService } from "./message/private-msg.sevice";

@Module({
	imports: [
		UserModule,
		TypeOrmModule.forFeature([
			Conversation,
			PrivateMessage,
		]),
	],
	providers: [ ConversationService, PrivateMessageService,
		{
			provide: APP_INTERCEPTOR,
			useClass: ClassSerializerInterceptor,
		}],
	exports: [ PrivateMessageService ],
})
export class ConversationModule {}