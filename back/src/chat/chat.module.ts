import { Module } from '@nestjs/common';
// import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from 'src/entities/channel.entity';
import { Message } from 'src/entities/message.entity';
import { ChannelService } from './channel.service';
import { MessageService } from './message.service';
import { AuthModule } from 'src/auth/auth.module';
import { UserInChannel } from 'src/entities/userInChannel.entity';
import { User } from 'src/entities/user.entity';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([Channel, Message, UserInChannel, User]),
  ],
  providers: [ChatGateway, ChannelService, MessageService]
})
export class ChatModule {}
