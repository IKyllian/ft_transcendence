import { ClassSerializerInterceptor, ConflictException, UseGuards, UseInterceptors } from '@nestjs/common';
import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, WsException } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { WsJwtGuard } from 'src/auth/guard/ws-jwt.guard';
import { ChannelMessage, User } from 'src/typeorm';
import { ChannelService } from './channel/channel.service';
import { ChatSessionManager } from './chat.session';
import { MessageDto } from './dto/message.dto';
import { UserService } from 'src/user/user.service';
import { JwtPayload } from 'src/utils/types/types';
import { GetUser } from 'src/utils/decorators';
import { ChannelMessageService } from './channel/message/ChannelMessage.service';
import { ChannelMessageDto } from './channel/message/dto/channelMessage.dto';


@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000'],
    credential: true,
  }
})
@UseInterceptors(ClassSerializerInterceptor)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;

  constructor(
    // private readonly chatService: ChatService,
    private channelMsgService: ChannelMessageService,
    private authService: AuthService,
    private channelService: ChannelService,
    private readonly session: ChatSessionManager,
    private userService: UserService,
    ) {}

  async handleConnection(socket: Socket) {
    let user: User = null;
    if (socket.handshake.headers.authorization) {
      const token = socket.handshake.headers.authorization.split(' ')[1];
      user = await this.authService.verify(token);
    }

    if (!user) {
      // throw new WsException('invalid credential');
      console.log(user, 'invalid credential')
      return socket.disconnect();
      // socket.emit('connection', 'failed');
    }
    console.log(user.username, 'connected')
    if (user.status === 'offline') {
      this.userService.setStatus(user, 'online');
      socket.emit('statusUpdate', { user, status: 'online' });
    }
    this.session.setUserSocket(user.id, socket);
  }

  async handleDisconnect(socket: Socket) {
    if (socket.handshake.headers.authorization) {
      const payload = this.authService.decodeJwt(socket.handshake.headers.authorization.split(' ')[1]) as JwtPayload;
      this.session.removeUserSocket(payload.sub);
      const user = await this.userService.findOne({id: payload.sub });
      if (user) {
        this.userService.setStatus(user, 'offline');
        socket.emit('statusUpdate', { user, status: 'offline' });
      }
      console.log(payload.username, 'disconnected');
    } else
        console.log(socket.id, 'disconnected');
  }

  // async handleJoinConversation(user: User, channel_id: number) {
  //   const socket = this.session.getUserSocket(user.id);
  //   // console.log(socket)
  //   if (!socket)
  //     return;
  //   socket.join(`channel-${channel_id}`);
  //   console.log(`${user.username} joining channel ${channel_id}`);
  //   const clients = (await this.server.in(`channel-${channel_id}`).fetchSockets()).map(client => client.id)
  //   console.log('clients in room: ', clients)
  // }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('JoinChannelRoom')
  async joinChannelRoom(
    @ConnectedSocket() client: Socket,
    @GetUser() user: User,
    @MessageBody() data: any,
  ) {
    try {
      const chanInfo = await this.channelService.getChannelById(user, data.id);
      client.join(`channel-${ chanInfo.id }`);
    } catch (e) {
        throw new WsException(e.message);
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('LeaveChannelConversation')
  leaveChannelRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any) {
    console.log(data)
    client.leave(`channel-${ data.id }`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('ChannelMessage')
  async sendChannelMessage(
    @ConnectedSocket() client: Socket,
    @GetUser() user: User,
    @MessageBody() data: any,
    ) {
    try {
      // interceptor doesnt work...
      const message = await this.channelMsgService.create(user, data);
      client.to(`channel-${ data.destId }`).emit('newChannelMessage', message);
    }
    catch(e) {
      console.log(e.message)
      throw new WsException(e.message);
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('onLeaveRoom')
  leaveRoom(@GetUser() user: User, roomId: number) {
    const socket = this.session.getUserSocket(user.id);
    // console.log(socket)
    if (!socket)
      return;
    socket.leave(`channel-${roomId}`);
  }

  // handleMessageToSend(message: Message) {
  //   const socket = this.session.getUserSocket(message.sender.id);
  //   if (!socket) {
  //     console.log('room not joined')
  //     return;

  //   }
  //   // this.server.to(`channel-${message.channel.id}`).emit('message', message);
  //   console.log(`${message.sender.username} sending message`)
  //   socket.to(`channel-${message.channel.id}`).emit('message', message);
  // }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('joinRoom')
  joinRoom(@ConnectedSocket() socket: Socket, channel_id: number){
    socket.join(`channel-${channel_id}`);
  }
}
