import { UnauthorizedException, UseFilters, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { JwtGameGuard } from "src/auth/guard/jwt-game.guard";
import { WsJwtGuard } from "src/auth/guard/ws-jwt.guard";
import { UserIdDto } from "src/chat/gateway/dto/user-id.dto";
import { User } from "src/typeorm";
import { GetUser } from "src/utils/decorators";
import { GatewayExceptionFilter } from "src/utils/exceptions/filter/Gateway.filter";
import { AuthenticatedSocket } from "src/utils/types/auth-socket";
import { GameMode } from "src/utils/types/game.types";
import { notificationType } from "src/utils/types/types";
import { UserSessionManager } from "../user.session";
import { IsReadyDto } from "./dto/boolean.dto";
import { IdDto } from "./dto/id.dto";
import { PartyService } from "./party/party.service";
import { QueueService } from "./queue/queue.service";

// @UseFilters(GatewayExceptionFilter)
// @UsePipes(new ValidationPipe())
@WebSocketGateway()
export class MatchmakingGateway {
	@WebSocketServer() server: Server;

	constructor(
		private readonly userSession: UserSessionManager,
		private partyService: PartyService,
		private queueService: QueueService,
	) {}


	afterInit(server: Server)
	{
	  this.partyService.server = server;
	}


	@UseGuards(WsJwtGuard)
	@SubscribeMessage('PartyInvite')
	async sendGameInvite(
		@GetUser() user: User,
		@ConnectedSocket() socket: Socket,
		@MessageBody() dto: UserIdDto,
	) {
		if (!this.partyService.partyJoined.getParty(user.id)) {
			const party = this.partyService.createParty(user);
			socket.emit("PartyCreated", party);
			socket.join(`party-${party.id}`)
		}

		const notif: any = {
			requester: user,
			type: notificationType.GAME_INVITE
		}
		socket.to(`user-${dto.id}`).emit('NewPartyInvite', notif);
	}

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

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('CreateParty')
	createLobby(
		@GetUser() user: User,
		@ConnectedSocket() socket: Socket,
	) {
		if (!this.partyService.partyJoined.getParty(user.id)) {
			const party = this.partyService.createParty(user);
			socket.emit("PartyCreated", party);
			socket.join(`party-${party.id}`)
		}
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('JoinParty')
	joinLobby(
		@GetUser() user: User,
		@ConnectedSocket() socket: Socket,
		@MessageBody() requester: IdDto
	) {
		//Todo: get confirmation that user is invited
		this.partyService.joinParty(user, socket, requester.id);
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('LeaveParty')
	leaveLobby(
		@GetUser() user: User,
		@ConnectedSocket() socket: Socket,
	) {
		this.partyService.leaveParty(user, socket);
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('SetReadyState')
	setReadyState(
		@GetUser() user: User,
		@ConnectedSocket() socket: Socket,
		@MessageBody() data: IsReadyDto,
	) {
		this.partyService.setReadyState(user, socket, data.isReady);
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('StartQueue')
	startQueue(
		@GetUser() user: User,
		@MessageBody() data: { gameMode: GameMode}
	) {
		if (data.gameMode === GameMode.OneVsOne)
			this.queueService.join1v1Queue(user);
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('test')
	test(@ConnectedSocket() socket: Socket, @GetUser() user: User) {
		if (!this.partyService.partyJoined.getParty(user.id)) {
			const party = this.partyService.createParty(user);
			socket.emit("PartyCreated", party);
			socket.join(`party-${party.id}`)
		}
		const party = this.partyService.partyJoined.getParty(user.id);
		console.log(party)
		party.gameSetting.ball_acceleration++;
	}
}