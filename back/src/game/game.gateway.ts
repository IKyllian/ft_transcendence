import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import {
	WebSocketGateway,
	WebSocketServer,
	SubscribeMessage,
	OnGatewayConnection,
	OnGatewayDisconnect,
	ConnectedSocket,
	MessageBody,
	OnGatewayInit
  } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { User } from 'src/typeorm';
import { UserService } from 'src/user/user.service';
import { JwtPayload } from 'src/utils/types/types';
import { LobbyFactory } from './lobby/lobby.factory';
import { AuthenticatedSocket } from '../utils/types/auth-socket';
import { GatewayExceptionFilter } from 'src/utils/exceptions/filter/Gateway.filter';
import { GlobalService } from 'src/utils/global/global.service';

@UseFilters(GatewayExceptionFilter)
@UsePipes(new ValidationPipe())
@WebSocketGateway({ namespace: 'game' })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{

	/* ----- Initialisation ----- */

	@WebSocketServer() server: Server;

	constructor(
		private readonly lobbyfactory: LobbyFactory,
		private readonly authService: AuthService,
		private readonly userService: UserService,
		private global: GlobalService,
	  ) {}

	  afterInit(server: Server) {
		this.global.game_server = server;
	  }

	/* ----- Connect/Disconnect ----- */

	async handleConnection(client: AuthenticatedSocket)
	{
		let user: User = null;
		console.log("connecting: " + client.id)
		if (client.handshake.headers.authorization) {
			const token = client.handshake.headers.authorization.split(' ')[1];
			user = await this.authService.verify(token);
		}
		if (user) {
			client.user = user;
		if (((await this.server.in(`user-in-game-${user.id}`).fetchSockets()).length > 0)) {
				client.emit('MultiTabError');
				client.disconnect();
			} else {
				client.join(`user-in-game-${user.id}`);
				client.emit('Connected')
			}
		} else {
			client.emit("Unauthorized");
			client.disconnect();
		}
	}
  
	async handleDisconnect(socket: AuthenticatedSocket)
	{
		console.log("disconnecting: " + socket.id)
		if (socket.handshake.headers.authorization) {
			const payload = this.authService.decodeJwt(socket.handshake.headers.authorization.split(' ')[1]) as JwtPayload;
			const user = await this.userService.findOneBy({ id: payload?.sub });
			if (user) {
				socket.leave(`user-in-game-${user.id}`);
			}
		}
		this.lobbyfactory.lobby_quit(socket);
	}
		
	/* ----- Users Lobby Management ----- */
		
	@SubscribeMessage('user_join_lobby')
	async onUserJoinLobby(@ConnectedSocket() client: AuthenticatedSocket,
	@MessageBody() game_id: string)
	{
		this.lobbyfactory.lobby_join(client, game_id);
	}
	
	@SubscribeMessage('user_lobby_request_status')
	async onUserLobbyRequestStatus(@ConnectedSocket() client: AuthenticatedSocket,
	@MessageBody() game_id: string)
	{
		this.lobbyfactory.lobby_request_status(client, game_id);
	}
	
	/* ----- Users Game Management ----- */
	
	
	@SubscribeMessage('user_game_input')
	async onUserGameInput(
	@ConnectedSocket() client: AuthenticatedSocket,
	@MessageBody() data: any)
	{
		this.lobbyfactory.lobby_game_input(client, data);
	}


	@SubscribeMessage('user_game_get_round_setup')
	async onUserGameGetRoundSetup(@ConnectedSocket() client: AuthenticatedSocket,
	@MessageBody() game_id: string)
	{
		this.lobbyfactory.lobby_game_get_round_setup(client, game_id);
	}
  }
