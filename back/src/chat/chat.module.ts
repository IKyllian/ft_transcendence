import { ClassSerializerInterceptor, forwardRef, Module } from '@nestjs/common';
import { ChatGateway } from './gateway/chat.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { Channel, User, ChannelUser, Statistic, ChannelMessage, Conversation, PrivateMessage } from 'src/typeorm';
import { ChatSessionManager } from './gateway/chat.session';
import { ChannelModule } from './channel/channel.module';
import { UserModule } from 'src/user/user.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConversationModule } from './conversation/conversation.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    ChannelModule,
    ConversationModule,
    NotificationModule,
    UserModule,
    forwardRef(() => AuthModule),
    TypeOrmModule.forFeature([
      Channel,
      ChannelUser,
      ChannelMessage,
      User,
      Statistic,
      // Conversation,
      // PrivateMessage, // useless?
    ]),
  ],
  providers: [ChatGateway, ChatSessionManager,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    }],
  exports: [ChatGateway]
})
export class ChatModule {}
