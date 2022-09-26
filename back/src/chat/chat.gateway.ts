import { UseGuards } from '@nestjs/common';
import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, WsException } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { WsJwtGuard } from 'src/auth/guard/ws-jwt.guard';
import { Message, User } from 'src/typeorm';
import { ChannelService } from './channel/channel.service';
import { ChatSessionManager } from './chat.session';
import { MessageDto } from './dto/message.dto';
import { MessageService } from './message/message.service';
import { UserService } from 'src/user/user.service';
import { JwtPayload } from 'src/utils/types/types';
import { GetUser } from 'src/utils/decorators';


@WebSocketGateway({
  // cors: true
  cors: {
    origin: ['http://localhost:3000'],
    credential: true,
  }
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;

  constructor(
    // private readonly chatService: ChatService,
    private messageService: MessageService,
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
      console.log('invalid credential')
      // socket.emit('connection', 'failed');
      return socket.disconnect();
    }
    console.log(user.username, 'connected')
    this.userService.setStatus(user, 'online');
    this.session.setUserSocket(user.id, socket);
    socket.emit('userConnected', user);
  }

  async handleDisconnect(socket: Socket) {
    if (socket.handshake.headers.authorization) {
      const payload = this.authService.decodeJwt(socket.handshake.headers.authorization.split(' ')[1]) as JwtPayload;
      this.session.removeUserSocket(payload.sub);
      const user = await this.userService.findOne({id: payload.sub });
      this.userService.setStatus(user, 'offline');
      socket.emit('userDisconnected', user);
      console.log(user.username, 'disconnected');
    } else
        console.log(socket.id, 'disconnected');
  }

  async handleJoinConversation(user: User, channel_id: number) {
    const socket = this.session.getUserSocket(user.id);
    // console.log(socket)
    if (!socket)
      return;
    socket.join(`channel-${channel_id}`);
    console.log(`${user.username} joining channel ${channel_id}`);
    const clients = await (await this.server.in(`channel-${channel_id}`).fetchSockets()).map(client => client.id)
    console.log('clients in room: ', clients)
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

  handleMessageToSend(message: Message) {
    const socket = this.session.getUserSocket(message.sender.id);
    if (!socket) {
      console.log('pas de socket')
      return;

    }
    //check if socket joined the room
    // this.server.to(`channel-${message.channel.id}`).emit('message', message);
    console.log(`${message.sender.username} sending message`)
    socket.to(`channel-${message.channel.id}`).emit('message', message);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('joinRoom')
  joinRoom(@ConnectedSocket() socket: Socket, channel_id: number){
    socket.join(`channel-${channel_id}`);
  }
}
