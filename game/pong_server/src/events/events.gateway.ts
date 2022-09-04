import {
	WebSocketGateway,
	WebSocketServer,
	SubscribeMessage,
	OnGatewayConnection,
	OnGatewayDisconnect,
  } from '@nestjs/websockets';
  
  @WebSocketGateway({ cors: true })
  export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer() server;
	users: number = 0;
	
  
	async handleConnection() {
	  // A client has connected
	  this.users++;
console.log("someone connected");
	  // Notify connected clients of current users
	  this.server.emit('ok_connect', this.users);
	}
  
	async handleDisconnect() {
	  // A client has disconnected
	  this.users--;
console.log("someone disconnected");
	  // Notify connected clients of current users
	  this.server.emit('ok_message', this.users);
	}
  
	@SubscribeMessage('pouet')
	async onPouet() {
		console.log("someone called pouet");
		this.server.emit('ok_pouet', this.users);
	}





  }


//   @SubscribeMessage('join')
//  async onJoin(@ConnectedSocket() client: Socket, @MessageBody() data: ChatMessage) {}