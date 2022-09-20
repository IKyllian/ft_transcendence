import { UseGuards } from '@nestjs/common';
import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { WsJwtGuard } from 'src/auth/guard/ws-jwt.guard';
import { User } from 'src/typeorm';
import { ChannelService } from './channel/channel.service';
import { MessageDto } from './dto/message.dto';
import { MessageService } from './message.service';


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
    ) {}

  async handleConnection(client: Socket) {
    console.log(client.id, 'connected')
    const token = client.handshake.headers.authorization.split(' ')[1];
    const user = await this.authService.verify(token);
    if (!user) {
      console.log('invalid credential')
      client.emit('connection', 'failed');
      client.disconnect();
    }
    client.emit('connection', "success");
    client.join('general');
  }

  handleDisconnect(client: Socket) {
    console.log(client.id, 'disconnected')
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('createMessage')
  async create(
    @MessageBody() messageDto: MessageDto,
    @ConnectedSocket() client: Socket,
    @GetUser() user: User,
    ) {
    const message = await this.messageService.create(messageDto);
    // this.server.emit('message', message);
    this.server.in('lolroom').emit('message', message);
    // client.to(client.id).emit('message', message);
    // client.in('lolroom').emit('message', message);
    console.log('message: ', message);
    
    return message;
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('test')
  test(@GetUser() user: User, @ConnectedSocket() client: Socket) {
    client.send("cc");

  }

  @SubscribeMessage('findAllMessages')
  findAll() {
    // return this.chatService.findAll();
  }

  @SubscribeMessage('joinChannel')
  joinChannel(
    @MessageBody('sender') name: string,
    @ConnectedSocket() client: Socket,
  ) {
    // return this.channelService.joinChannel(name, client.id);
    return { }
  }

  @SubscribeMessage('leaveChannel')
  leaveChannel() {

  }

}
