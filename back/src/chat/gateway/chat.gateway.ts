import { ArgumentsHost, BadRequestException, Catch, ClassSerializerInterceptor, ExceptionFilter, HttpException, UseFilters, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, WsException, BaseWsExceptionFilter } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { WsJwtGuard } from 'src/auth/guard/ws-jwt.guard';
import { ChannelMessage, User } from 'src/typeorm';
import { ChannelService } from '../channel/channel.service';
import { ChatSessionManager } from './chat.session';
import { MessageDto } from '../channel/dto/message.dto';
import { UserService } from 'src/user/user.service';
import { JwtPayload } from 'src/utils/types/types';
import { GetUser } from 'src/utils/decorators';
import { ChannelMessageService } from '../channel/message/ChannelMessage.service';
import { ChannelMessageDto } from '../channel/message/dto/channelMessage.dto';
import { RoomDto } from './dto/room.dto';

@Catch()
class GatewayExceptionFilter extends BaseWsExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    if (exception instanceof WsException)
      super.catch(exception, host);
    else {
      const properException = new WsException(exception.getResponse());
      super.catch(properException, host);
    }
  }
}

@UseFilters(GatewayExceptionFilter)
@UsePipes(new ValidationPipe())
@WebSocketGateway({
  cors: {
    // origin: ['http://localhost:3000'],
    credential: true,
  }
})
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
    this.server.to(socket.id).emit('StatusUpdate', user);
    socket.join(`user-${user.id}`);
    if (user.status === 'offline') {
      this.userService.setStatus(user, 'online');
    }
    this.session.setUserSocket(socket.id, { user, socket });
  }

  async handleDisconnect(socket: Socket) {
    if (socket.handshake.headers.authorization) {
      const payload = this.authService.decodeJwt(socket.handshake.headers.authorization.split(' ')[1]) as JwtPayload;
      // get usersocket instance instead of call db ?
      this.session.removeUserSocket(socket.id);
      const user = await this.userService.findOneBy({ id: payload.sub });
      if (user) {
        this.userService.setStatus(user, 'offline');
        socket.emit('statusUpdate', { user, status: 'offline' });
      }
      console.log(payload.username, 'disconnected');
    } else
        console.log(socket.id, 'disconnected');
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('JoinChannelRoom')
  async joinChannelRoom(
    @ConnectedSocket() client: Socket,
    @GetUser() user: User,
    @MessageBody() room: RoomDto,
  ) {
    console.log(user.username + ' joined room')
    const chanInfo = await this.channelService.getChannelById(user, room.id);
    client.emit('roomData', chanInfo);
    client.join(`channel-${ chanInfo.id }`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('LeaveChannelRoom')
  leaveChannelRoom(
    @ConnectedSocket() client: Socket,
    @GetUser() user: User,
    @MessageBody() room: RoomDto) {
    client.leave(`channel-${ room.id }`);
    console.log(user.username + ' left room')
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('ChannelMessage')
  async sendChannelMessage(
    @ConnectedSocket() socket: Socket,
    @GetUser() user: User,
    @MessageBody() data: ChannelMessageDto,
    ) {
    //   const clients = (await this.server.in(`channel-${ data.chanId }`).fetchSockets()).map(client => client.id)
    //   console.log('clients in room: ', clients)
      const message = await this.channelMsgService.create(user, data);
      this.server.to(`channel-${ data.chanId }`).emit('NewChannelMessage', message);
  }
}

