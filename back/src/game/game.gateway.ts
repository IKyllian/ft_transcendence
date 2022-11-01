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
import { NewGameData, PlayersLobbyData, LobbyRequest, GameMode } from 'src/utils/types/game.types';
import { JwtPayload, notificationType, UserPayload } from 'src/utils/types/types';
import { UserSessionManager } from './user.session';
import { LobbyFactory } from './lobby/lobby.factory';
import { Party } from './matchmaking/party/party';
import { GameUser } from './game-user';
import { PartyService } from './matchmaking/party/party.service';
import { SocketReservedEventsMap } from 'socket.io/dist/socket';
import { RoomDto } from 'src/chat/gateway/dto/room.dto';
import { threadId } from 'worker_threads';
import { BlobOptions } from 'buffer';
import { JwtGameGuard } from 'src/auth/guard/jwt-game.guard';
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
	admin?: Socket;
//get admin secret from envs
	admin_secret: string = 'praclarushtaonas';
	constructor(
		private readonly lobbyfactory: LobbyFactory,
		private readonly userSession: UserSessionManager,
		private readonly authService: AuthService,
		private readonly userService: UserService,
	  ) {}

	afterInit(server: Server): any
	{
	  this.lobbyfactory.server = server;
	}


	/* ----- Connect/Disconnect ----- */

	async handleConnection(client: Socket)
	{
		console.log("someone connected", client['id']);
		let user: User = null;
		if (client.handshake.headers.authorization) {
			const token = client.handshake.headers.authorization.split(' ')[1];
			user = await this.authService.verify(token);
		}
		if (!user) {
			// Found something to do in this case
			console.log(user, 'invalid credential')
			return client.disconnect();
		} else if (this.userSession.getUser(user.id)) {
			client.disconnect();
			throw new UnauthorizedException("You can't play in multi tab!");
		}
		this.userSession.setUser(user.id, user);
	}
  
	async handleDisconnect(socket: Socket)
	{
		// TODO handle different type of disconnect; Ex: multitab error, lost connection
		if (socket.handshake.headers.authorization) {
			const payload = this.authService.decodeJwt(socket.handshake.headers.authorization.split(' ')[1]) as JwtPayload;
			// get usersocket instance instead of call db ?
			const user = await this.userService.findOneBy({ id: payload?.sub });
			if (user) {
				this.userSession.removeUser(user.id)
			}
			console.log(payload?.username, 'disconnected');
		} else
			console.log(socket.id, 'disconnected');
		this.lobbyfactory.lobby_quit(socket);
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
		// if (client['id'] == this.admin['id'])
		// {
			const gamedata: NewGameData = this.lobbyfactory.lobby_create(data);
			console.log(gamedata);

//TODO
//preparer les PlayersGameData de chaque joueur avec le NewGameData
//envoyer les PlayersGameData au joeuurs concerne
//-->NEED identification des sockets

			client.emit('newgame_data', gamedata);
		// }
		// else
		// {
		// 	//log the event somewhere
		// }	
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


	@UseGuards(JwtGameGuard)
	@SubscribeMessage('user_game_input')
	async onUserGameInput(
	@ConnectedSocket() client: AuthenticatedSocket,
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

	/* ----- Invite ----- */

	// @UseGuards(WsJwtGuard)
	// @SubscribeMessage('GameInvite')
	// async sendGameInvite(
	// 	@GetUser() user: User,
	// 	@ConnectedSocket() socket: Socket,
	// 	@MessageBody() dto: UserIdDto,
	// ) {
	// 	delete user.channelUser;
	// 	delete user.blocked;

	// 	let lobby = this.partyService.partyJoined.getParty(user.id);
	// 	if (!lobby) {
	// 		lobby = this.partyService.createParty(user);
	// 		socket.emit("LobbyCreated", lobby);
	// 	}

	// 	const notif: any = {
	// 		requester: user,
	// 		type: notificationType.GAME_INVITE
	// 	}
	// 	socket.to(`user-${dto.id}`).emit('NewGameInvite', notif);
	// }

	// // @UseGuards(WsJwtGuard)
	// // @SubscribeMessage('AcceptGameInvite')
	// // async acceptGameInvite(
	// // 	@ConnectedSocket() socket: Socket,
	// // 	@GetUser() user: User,
	// // 	@MessageBody() dto: UserIdDto,
	// // ) {
	// // 	// const addressee = await this.userService.findOneBy({ id: dto.id });
	// // 	// if (!addressee)
	// // 	// 	throw new NotFoundException('User not found');

	// // 	socket.to(`user-${dto.id}`).emit('JoinLobby', user);
	// // }

	// @UseGuards(WsJwtGuard)
	// @SubscribeMessage('JoinLobbyPage')
	// getLobbyPage(
	// 	@ConnectedSocket() socket: Socket,
	// 	@GetUser() user: User,
	// ) {
	// 	let gameUser = this.userSession.getUser(user.id);
	// 	if (gameUser)
	// 		throw new UnauthorizedException("You can't play in multi tab!");
	// 	this.userSession.setUser(user.id, user);
	// 	const lobbyJoined = this.partyService.partyJoined.getParty(user.id);
	// 	console.log(lobbyJoined)
	// }

	// @UseGuards(WsJwtGuard)
	// @SubscribeMessage('LeaveLobbyPage')
	// leaveLobbyPage(
	// 	@GetUser() user: User,
	// 	@ConnectedSocket() socket: Socket,
	// ) {
	// 	// Not sure about that..
	// 	let lobby = this.partyService.partyJoined.getParty(user.id);
	// 	if (lobby) {
	// 		this.partyService.getGameUserInParty(user.id, lobby.players).isReady = false;
	// 		socket.to(`lobby-${lobby.id}`).emit('lobbyUpdate', lobby);
	// 	}

	// 	this.userSession.removeUser(user.id);
	// }

	// @UseGuards(WsJwtGuard)
	// @SubscribeMessage('CreateLobby')
	// createLobby(
	// 	@GetUser() user: User,
	// 	@ConnectedSocket() socket: Socket,
	// ) {
	// 	if (!this.partyService.partyJoined.getParty(user.id)) {
	// 		const lobby = this.partyService.createParty(user);
	// 		socket.emit("LobbyCreated", lobby);
	// 	}
	// }

	// @UseGuards(WsJwtGuard)
	// @SubscribeMessage('JoinLobby')
	// joinLobby(
	// 	@GetUser() user: User,
	// 	@ConnectedSocket() socket: Socket,
	// 	@MessageBody() requester: any // TODO dto
	// ) {
	// 	this.partyService.joinParty(user, socket, requester.id);
	// }

	// @UseGuards(WsJwtGuard)
	// @SubscribeMessage('LeaveLobby')
	// leaveLobby(
	// 	@GetUser() user: User,
	// 	@ConnectedSocket() socket: Socket,
	// ) {
	// 	this.partyService.leaveParty(user, socket);
	// }

	// @UseGuards(WsJwtGuard)
	// @SubscribeMessage('SetReadyState')
	// setReadyState(
	// 	@GetUser() user: User,
	// 	@ConnectedSocket() socket: Socket,
	// 	@MessageBody() data: { isReady: boolean } //TODO dto
	// ) {
	// 	this.partyService.setReadyState(user, socket, data.isReady);
	// }

	// @UseGuards(WsJwtGuard)
	// @SubscribeMessage('StartQueue')
	// startQueue(
	// 	@GetUser() user: User,
	// 	@MessageBody() data: { gameMode: GameMode}
	// ) {
	// 	if (data.gameMode === GameMode.OneVsOne) {
	// 		this.queueService.join1v1Queue(user);
	// 	}
	// }
  }
