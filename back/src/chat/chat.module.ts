import { forwardRef, Module } from '@nestjs/common';
// import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelService } from './channel/channel.service';
import { MessageService } from './message.service';
import { AuthModule } from 'src/auth/auth.module';
import { Channel, Message, User, UserInChannel } from 'src/typeorm';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    TypeOrmModule.forFeature([Channel, Message, UserInChannel, User]),
  ],
  providers: [ChatGateway, ChannelService, MessageService],
  exports: [ChannelService]
})
export class ChatModule {}
