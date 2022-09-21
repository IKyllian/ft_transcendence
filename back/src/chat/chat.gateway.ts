import { UseGuards } from '@nestjs/common';
import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { WsJwtGuard } from 'src/auth/guard/ws-jwt.guard';
import { Message, User } from 'src/typeorm';
import { ChannelService } from './channel/channel.service';
import { ChatSessionManager } from './chat.session';
import { MessageDto } from './dto/message.dto';
import { MessageService } from './message/message.service';
import { JwtPayload } from 'src/utils/types/jwtPayload';


@WebSocketGateway({
  // cors: true
  cors: {
    origin: ['http://localhost:3000'],
    credential: true
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
    ) {}

  async handleConnection(socket: Socket) {
    const token = socket.handshake.headers.authorization.split(' ')[1];
    const user = await this.authService.verify(token);
    if (!user) {
      console.log('invalid credential')
      socket.emit('connection', 'failed');
      return socket.disconnect();
    }
    console.log(user.username, 'connected')
    socket.emit('connection', "success");
    this.session.setUserSocket(user.id, socket);
  }

  handleDisconnect(socket: Socket) {
    const user = this.authService.decodeJwt(socket.handshake.headers.authorization.split(' ')[1]) as JwtPayload;
    console.log(user.username, 'disconnected')
    this.session.removeUserSocket(user.sub)
  }

  handleMessageToSend(message: Message) {
    const socket = this.session.getUserSocket(message.sender.id);
    // socket.to(`channel-${message.channel.id}`).emit('message', message);
  }
}
