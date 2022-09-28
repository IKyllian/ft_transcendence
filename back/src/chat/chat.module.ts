import { ClassSerializerInterceptor, forwardRef, Module } from '@nestjs/common';
// import { ChatService } from './chat.service';
import { ChatGateway } from './gateway/chat.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelService } from './channel/channel.service';
import { AuthModule } from 'src/auth/auth.module';
import { Channel, User, ChannelUser, Statistic, ChannelMessage } from 'src/typeorm';
import { ChannelController } from './channel/channel.controller';
import { ChatSessionManager } from './gateway/chat.session';
import { UserService } from 'src/user/user.service';
import { ChannelModule } from './channel/channel.module';
import { UserModule } from 'src/user/user.module';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    ChannelModule,
    UserModule,
    forwardRef(() => AuthModule),
    TypeOrmModule.forFeature([Channel, ChannelUser, ChannelMessage, User, Statistic]), // needed?
  ],
  providers: [ChatGateway, ChatSessionManager,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    }],
  exports: [ChatGateway]
})
export class ChatModule {}
