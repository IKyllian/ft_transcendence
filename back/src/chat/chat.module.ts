import { forwardRef, Module } from '@nestjs/common';
// import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelService } from './channel/channel.service';
import { MessageService } from './message/message.service';
import { AuthModule } from 'src/auth/auth.module';
import { Channel, Message, User, UserInChannel } from 'src/typeorm';
import { ChannelController } from './channel/channel.controller';
import { ChatSessionManager } from './chat.session';
import { MessageController } from './message/message.controller';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    TypeOrmModule.forFeature([Channel, Message, UserInChannel, User]),
  ],
  providers: [ChatGateway, ChannelService, MessageService, ChatSessionManager],
  controllers: [ChannelController, MessageController],
  exports: [ChannelService]
})
export class ChatModule {}
