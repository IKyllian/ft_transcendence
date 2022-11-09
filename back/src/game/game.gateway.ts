import { UnauthorizedException, UseFilters, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import {
	WebSocketGateway,
	WebSocketServer,
	SubscribeMessage,
	OnGatewayConnection,
	OnGatewayDisconnect,
	ConnectedSocket,
	MessageBody
  } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { WsJwtGuard } from 'src/auth/guard/ws-jwt.guard';
import { UserIdDto } from 'src/chat/gateway/dto/user-id.dto';
import { User } from 'src/typeorm';
import { UserService } from 'src/user/user.service';
import { GetUser } from 'src/utils/decorators';

// import { NewGameData, PlayersLobbyData, LobbyRequest } from 'src/utils/types/game.types';

import { JwtPayload, notificationType, UserPayload } from 'src/utils/types/types';
import { UserSessionManager } from './user.session';
import { LobbyFactory } from './lobby/lobby.factory';
import { Party } from './matchmaking/party/party';
import { Player } from './player';
import { PartyService } from './matchmaking/party/party.service';
import { SocketReservedEventsMap } from 'socket.io/dist/socket';
import { RoomDto } from 'src/chat/gateway/dto/room.dto';
import { threadId } from 'worker_threads';
import { BlobOptions } from 'buffer';
import { AuthenticatedSocket } from '../utils/types/auth-socket';
import { QueueService } from './matchmaking/queue/queue.service';
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
		console.log(client.id);
		let user: User = null;
		client.multiTab = false;
		if (client.handshake.headers.authorization) {
			const token = client.handshake.headers.authorization.split(' ')[1];
			user = await this.authService.verify(token);
		}
		if (user) {
			client.user = user;
			console.log("Game Gateway Connection: ", client.user.username);
			if (this.userSession.getUser(user.id)) {
				client.multiTab = true;
				client.emit('MultiTabError');
				client.disconnect();
			} else {
				this.userSession.setUser(user.id, user);
				client.emit('Connected')
			}
		} else {
			console.log('invalid credential')
			client.disconnect();
		}
	}
  
	async handleDisconnect(socket: AuthenticatedSocket)
	{
		// TODO handle different type of disconnect; Ex: multitab error, lost connection
		if (socket.handshake.headers.authorization) {
			const payload = this.authService.decodeJwt(socket.handshake.headers.authorization.split(' ')[1]) as JwtPayload;
			// get usersocket instance instead of call db ?
			const user = await this.userService.findOneBy({ id: payload?.sub });
			if (user && socket.multiTab === false) {
				this.userSession.removeUser(user.id)
				// console.log("Game Gateway Deconnection: ", user.username) 
			}
		}
 		// } else
		// 	console.log(socket.id, 'disconnected');
		// this.lobbyfactory.lobby_quit(socket);
		console.log("Game Gateway Deconnection: ", socket.user.username) 
	}

	@SubscribeMessage('ping')
	async onPing(client: Socket)
	{
		client.emit('pong');
	}

	/* ----- Administration ----- */

// 	@SubscribeMessage('admin_authenticate')
// 	async onAdminAuthenticate(@ConnectedSocket() client: Socket,
// 	@MessageBody() data: string)
// 	{
// 		if (data == this.admin_secret)
// 		{
// 			this.admin = client;
// 			console.log("admin has logged in");
// 			client.emit('admin_connection', true);
// 		}
// 		else
// 		{
// 			client.emit('admin_connection', false);
// 			//log the incident somewhere
// 		}
// 	}

// 	@SubscribeMessage('admin_newgame')
// 	async onAdminNewGame(@ConnectedSocket() client: Socket,
// 	@MessageBody() data: LobbyRequest)
// 	{
// 		// if (client['id'] == this.admin['id'])
// 		// {
			// const gamedata: NewGameData = this.lobbyfactory.lobby_create(data);
// 			console.log(gamedata);

// //TODO
// //preparer les PlayersGameData de chaque joueur avec le NewGameData
// //envoyer les PlayersGameData au joeuurs concerne
// //-->NEED identification des sockets

// 			client.emit('newgame_data', gamedata);
// 		// }
// 		// else
// 		// {
// 		// 	//log the event somewhere
// 		// }	
// 	}

	// @SubscribeMessage('admin_lobby_quantity')
	// async onAdminLobbyQuantity(@ConnectedSocket() client: Socket)
	// {
	// 	if (client['id'] == this.admin['id'])
	// 	{
	// 		client.emit('lobby_quantity', this.lobbyfactory.get_lobby_quantity());
	// 	}
	// 	else
	// 	{
	// 		//log the event somewhere
	// 	}	
	// }

	// @SubscribeMessage('admin_lobby_list')
	// async onAdminLobbyList(@ConnectedSocket() client: Socket,
	// @MessageBody() data: {player_A: string, player_B: string})
	// {
	// 	if (client['id'] == this.admin['id'])
	// 	{
	// 		client.emit('lobby_list', this.lobbyfactory.get_lobby_list());
	// 	}
	// 	else
	// 	{
		// 		//log the event somewhere
		// 	}	
		// }
		
		
		/* ----- Users Lobby Management ----- */
		
		@UseGuards(WsJwtGuard)
		@SubscribeMessage('user_join_lobby')
		async onUserJoinLobby(@ConnectedSocket() client: AuthenticatedSocket,
		@MessageBody() game_id: string)
		{
		console.log("joining lobby, ", client.user)
	//	console.log("user join lobby", data);
		this.lobbyfactory.lobby_join(client, game_id);
	}



//Irrelevant with waitingroom
	// @SubscribeMessage('user_is_ready')
	// async onUserisReady(@ConnectedSocket() client: Socket,
	// @MessageBody() game_id: string)
	// {
	// 	this.lobbyfactory.lobby_player_ready(client, game_id);
	// }

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('user_lobby_request_status')
	async onUserLobbyRequestStatus(@ConnectedSocket() client: AuthenticatedSocket,
	@MessageBody() game_id: string)
	{
		this.lobbyfactory.lobby_request_status(client, game_id);
	}
	
	/* ----- Users Game Management ----- */
	
	
	@UseGuards(WsJwtGuard)
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
		//this.lobbyfactory.lobby_game_input(data);
		this.lobbyfactory.lobby_game_get_round_setup(client, game_id);
	}




//commented for now

	/* ----- Replay Handling ----- */


	// @SubscribeMessage('replay_request')
	// async onReplayRequest(@ConnectedSocket() client: Socket,
	// @MessageBody() game_id: string)
	// {
	// 	this.lobbyfactory.send_replay(client, game_id);
	// }




  }
