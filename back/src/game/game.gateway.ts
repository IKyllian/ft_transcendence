import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import {
	WebSocketGateway,
	WebSocketServer,
	SubscribeMessage,
	OnGatewayConnection,
	OnGatewayDisconnect,
	ConnectedSocket,
	MessageBody
  } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { User } from 'src/typeorm';
import { UserService } from 'src/user/user.service';
import { JwtPayload } from 'src/utils/types/types';
import { UserSessionManager } from './user.session';
import { LobbyFactory } from './lobby/lobby.factory';
import { AuthenticatedSocket } from '../utils/types/auth-socket';
import { GatewayExceptionFilter } from 'src/utils/exceptions/filter/Gateway.filter';

@UseFilters(GatewayExceptionFilter)
@UsePipes(new ValidationPipe())
@WebSocketGateway({ namespace: 'game' })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect
{

	/* ----- Initialisation ----- */

	@WebSocketServer() server: Server;

	constructor(
		private readonly lobbyfactory: LobbyFactory,
		private readonly userSession: UserSessionManager,
		private readonly authService: AuthService,
		private readonly userService: UserService,
	  ) {}

	/* ----- Connect/Disconnect ----- */

	async handleConnection(client: AuthenticatedSocket)
	{
		let user: User = null;
		client.multi_tab = false;
		if (client.handshake.headers.authorization) {
			const token = client.handshake.headers.authorization.split(' ')[1];
			user = await this.authService.verify(token);
		}
		if (user) {
			client.user = user;
			console.log("Game Gateway Connection: ", client.user.username);
			if (this.userSession.getUser(user.id)) {
				client.multi_tab = true;
				client.emit('MultiTabError');
				client.disconnect();
			} else {
				this.userSession.setUser(user.id, user);
				client.emit('Connected')
			}
		} else {
			client.emit("Unauthorized");
			client.disconnect();
		}
	}
  
	async handleDisconnect(socket: AuthenticatedSocket)
	{
		if (socket.handshake.headers.authorization) {
			const payload = this.authService.decodeJwt(socket.handshake.headers.authorization.split(' ')[1]) as JwtPayload;
			const user = await this.userService.findOneBy({ id: payload?.sub });
			if (user && socket.multi_tab === false) {
				this.userSession.removeUser(user.id)
			}
		}
		console.log("Game Gateway deconnection: ", socket.user.username);
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
