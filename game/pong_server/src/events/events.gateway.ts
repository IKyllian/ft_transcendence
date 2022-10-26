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
import { LobbyFactory } from '../lobby/lobby.factory';
import { LobbyRequest, NewGameData, PlayerInput, PlayersLobbyData } from '../types/shared.types';


	@WebSocketGateway({cors: true})
  export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect
  {

	/* ----- Initialisation ----- */

	@WebSocketServer() server: Server;
	admin?: Socket;
//get admin secret from envs
	admin_secret: string = 'praclarushtaonas';

	constructor(
		private readonly lobbyfactory: LobbyFactory,
	  )
	  {
	  }

	afterInit(server: Server): any
	{
	  this.lobbyfactory.server = server;
	}


	/* ----- Connect/Disconnect ----- */

	async handleConnection(client: Socket)
	{
		console.log("someone connected", client['id']);
	}
  
	async handleDisconnect(client: Socket)
	{
		console.log("someone disconnected ", client['id']);
		this.lobbyfactory.lobby_quit(client);
	}

	@SubscribeMessage('ping')
	async onPing(client: Socket)
	{
		client.emit('pong');
	}

	/* ----- Administration ----- */

	@SubscribeMessage('admin_authenticate')
	async onAdminAuthenticate(@ConnectedSocket() client: Socket,
	@MessageBody() data: string)
	{
		if (data == this.admin_secret)
		{
			this.admin = client;
			console.log("admin has logged in");
			client.emit('admin_connection', true);
		}
		else
		{
			client.emit('admin_connection', false);
			//log the incident somewhere
		}
	}

	@SubscribeMessage('admin_newgame')
	async onAdminNewGame(@ConnectedSocket() client: Socket,
	@MessageBody() data: LobbyRequest)
	{
		if (client['id'] == this.admin['id'])
		{
			const gamedata: NewGameData = this.lobbyfactory.lobby_create(data);
			console.log(gamedata);
			client.emit('newgame_data', gamedata);
		}
		else
		{
			//log the event somewhere
		}	
	}

	@SubscribeMessage('admin_lobby_quantity')
	async onAdminLobbyQuantity(@ConnectedSocket() client: Socket)
	{
		if (client['id'] == this.admin['id'])
		{
			client.emit('lobby_quantity', this.lobbyfactory.get_lobby_quantity());
		}
		else
		{
			//log the event somewhere
		}	
	}

	@SubscribeMessage('admin_lobby_list')
	async onAdminLobbyList(@ConnectedSocket() client: Socket,
	@MessageBody() data: {player_A: string, player_B: string})
	{
		if (client['id'] == this.admin['id'])
		{
			client.emit('lobby_list', this.lobbyfactory.get_lobby_list());
		}
		else
		{
			//log the event somewhere
		}	
	}


	/* ----- Users Lobby Management ----- */


	@SubscribeMessage('user_join_lobby')
	async onUserJoinLobby(@ConnectedSocket() client: Socket,
	@MessageBody() data: PlayersLobbyData)
	{
	//	console.log("user join lobby", data);
		this.lobbyfactory.lobby_join(client, data);
	}

	@SubscribeMessage('user_is_ready')
	async onUserisReady(@ConnectedSocket() client: Socket,
	@MessageBody() game_id: string)
	{
		this.lobbyfactory.lobby_player_ready(client, game_id);
	}


	@SubscribeMessage('user_lobby_request_status')
	async onUserLobbyRequestStatus(@ConnectedSocket() client: Socket,
	@MessageBody() game_id: string)
	{
		this.lobbyfactory.lobby_request_status(client, game_id);
	}

	/* ----- Users Game Management ----- */


	@SubscribeMessage('user_game_input')
	async onUserGameInput(@ConnectedSocket() client: Socket,
	@MessageBody() data: any)
	{
		this.lobbyfactory.lobby_game_input(client, data);
	}


	@SubscribeMessage('user_game_get_round_setup')
	async onUserGameGetRoundSetup(@ConnectedSocket() client: Socket,
	@MessageBody() game_id: string)
	{
		//this.lobbyfactory.lobby_game_input(data);
		this.lobbyfactory.lobby_game_get_round_setup(client, game_id);
	}


	/* ----- Replay Handling ----- */


	@SubscribeMessage('replay_request')
	async onReplayRequest(@ConnectedSocket() client: Socket,
	@MessageBody() game_id: string)
	{
		this.lobbyfactory.send_replay(client, game_id);
	}

  }
