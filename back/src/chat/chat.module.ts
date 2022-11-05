import { ClassSerializerInterceptor, forwardRef, Module } from '@nestjs/common';
import { ChatGateway } from './gateway/chat.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { Channel, User, ChannelUser, Statistic, ChannelMessage, Conversation, PrivateMessage } from 'src/typeorm';
import { ChannelModule } from './channel/channel.module';
import { UserModule } from 'src/user/user.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConversationModule } from './conversation/conversation.module';
import { NotificationModule } from 'src/notification/notification.module';
import { MatchmakingModule } from 'src/game/matchmaking/matchmaking.module';
import { TaskScheduler } from 'src/task-scheduling/task.module';

@Module({
  imports: [
    ChannelModule,
    ConversationModule,
    NotificationModule,
    UserModule,
	  MatchmakingModule,
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
  providers: [ChatGateway,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    }],
  exports: [ChatGateway]
})
export class ChatModule {}
