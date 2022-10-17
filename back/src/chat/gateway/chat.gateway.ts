import { ArgumentsHost, BadRequestException, Catch, ClassSerializerInterceptor, ExceptionFilter, HttpException, UseFilters, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { WebSocketGateway, MessageBody, WebSocketServer, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, WsException, BaseWsExceptionFilter, SubscribeMessage } from '@nestjs/websockets';
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
import { PrivateMessageService } from '../conversation/message/private-msg.sevice';
import { PrivateMessageDto } from '../conversation/message/dto/privateMessage.dto';
import { UserIdDto } from './dto/user-id.dto';
import { FriendshipService } from 'src/user/friendship/friendship.service';
import { NotificationService } from 'src/notification/notification.service';
import { ResponseDto } from './dto/response.dto';
import { ChannelPasswordDto } from '../channel/dto/channel-pwd.dto';
import { ChannelInviteDto } from './dto/channel-invite.dto';

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
    private channelMsgService: ChannelMessageService,
    private privateMsgService: PrivateMessageService,
    private authService: AuthService,
    private channelService: ChannelService,
    private readonly session: ChatSessionManager,
    private userService: UserService,
    private friendshipService: FriendshipService,
    private notificationService: NotificationService,
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
    @ConnectedSocket() socket: Socket,
    @GetUser() user: User,
    @MessageBody() room: RoomDto,
  ) {
    console.log(user.username + ' joined room')
    const chanInfo = await this.channelService.getChannelById(user, room.id);
    socket.emit('roomData', chanInfo);
    socket.join(`channel-${ chanInfo.id }`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('LeaveChannelRoom')
  leaveChannelRoom(
    @ConnectedSocket() socket: Socket,
    @GetUser() user: User,
    @MessageBody() room: RoomDto) {
    socket.leave(`channel-${ room.id }`);
    console.log(user.username + ' left room')
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('ChannelMessage')
  async sendChannelMessage(
    @ConnectedSocket() socket: Socket,
    @GetUser() user: User,
    @MessageBody() data: ChannelMessageDto,
    ) {
    //   const sockets = (await this.server.in(`channel-${ data.chanId }`).fetchSockets()).map(socket => socket.id)
    //   console.log('sockets in room: ', sockets)
      const message = await this.channelMsgService.create(user, data);
      this.server.to(`channel-${ data.chanId }`).emit('NewChannelMessage', message);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('PrivateMessage')
  async sendPrivateMessage(
    @GetUser() user: User,
    @MessageBody() data: PrivateMessageDto,
    ) {
      const message = await this.privateMsgService.create(user, data);
      this.server
        .to(`user-${user.id}`)
        .to(`user-${data.adresseeId}`)
        .emit('NewPrivateMessage', message);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('FriendRequest')
  async sendFriendRequest(
    @GetUser() user: User,
    @ConnectedSocket() socket: Socket,
    @MessageBody() dto: UserIdDto,
  ) {
    const friendRequest = await this.friendshipService.sendFriendRequest(user, dto.id);
    const notif = await this.notificationService.createFriendRequestNotif(friendRequest);
    socket.to(`user-${dto.id}`).emit('NewNotication', notif);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('JoinChannel')
  async joinChannel(
    @GetUser() user: User,
    @ConnectedSocket() socket: Socket,
    @MessageBody() channel: RoomDto,
    @MessageBody() pwdDto?: ChannelPasswordDto,
  ) {
    const updatedChan = await this.channelService.join(user, channel.id, pwdDto);
    this.server.to(`channel-${channel.id}`).emit('ChannelUpdate', updatedChan);
    socket.to(`user-${user.id}`).emit('OnJoin', updatedChan);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('LeaveChannel')
  async leaveChannel(
    @GetUser() user: User,
    @ConnectedSocket() socket: Socket,
    @MessageBody() channel: RoomDto,
  ) {
    const updatedChan = await this.channelService.leave(user, channel.id);
    this.server.to(`channel-${channel.id}`).emit('ChannelUpdate', updatedChan);
    socket.to(`user-${user.id}`).emit('OnLeave', updatedChan);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('ChannelInvite')
  async channelInvite(
    @GetUser() user: User,
    @ConnectedSocket() socket: Socket,
    @MessageBody() dto: ChannelInviteDto,
  ) {
    const notif = await this.notificationService.createChanInviteNotif(user, dto);
    socket.to(`user-${dto.userId}`).emit('NewNotification', notif);
  }

  //TODO inform front to delete notif?
  @UseGuards(WsJwtGuard)
  @SubscribeMessage('ChannelInviteResponse')
  async respondToChannelInvite(
    @GetUser() user: User,
    @MessageBody() dto: ResponseDto
  ) {
    const updatedChan = await this.channelService.respondInvite(user, dto);
    if (updatedChan)
      this.server.to(`channel-${dto.id}`).emit('ChannelUpdate', updatedChan);
  }

}