import { UnauthorizedException, UseFilters, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Socket } from "socket.io";
import { WsJwtGuard } from "src/auth/guard/ws-jwt.guard";
import { UserIdDto } from "src/chat/gateway/dto/user-id.dto";
import { User } from "src/typeorm";
import { GetUser } from "src/utils/decorators";
import { GatewayExceptionFilter } from "src/utils/exceptions/filter/Gateway.filter";
import { GameMode } from "src/utils/types/game.types";
import { notificationType } from "src/utils/types/types";
import { Server } from "typeorm";
import { UserSessionManager } from "../user.session";
import { PartyService } from "./party/party.service";
import { QueueService } from "./queue/queue.service";

@UseFilters(GatewayExceptionFilter)
@UsePipes(new ValidationPipe())
@WebSocketGateway()
export class MatchmakingGateway {
	@WebSocketServer() server: Server;

	constructor(
		private readonly userSession: UserSessionManager,
		private partyService: PartyService,
		private queueService: QueueService,
	) {}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('PartyInvite')
	async sendGameInvite(
		@GetUser() user: User,
		@ConnectedSocket() socket: Socket,
		@MessageBody() dto: UserIdDto,
	) {
		let lobby = this.partyService.partyJoined.getParty(user.id);
		if (!lobby) {
			lobby = this.partyService.createParty(user);
			socket.emit("LobbyCreated", lobby);
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
	@SubscribeMessage('CreateLobby')
	createLobby(
		@GetUser() user: User,
		@ConnectedSocket() socket: Socket,
	) {
		if (!this.partyService.partyJoined.getParty(user.id)) {
			const lobby = this.partyService.createParty(user);
			socket.emit("LobbyCreated", lobby);
		}
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('JoinLobby')
	joinLobby(
		@GetUser() user: User,
		@ConnectedSocket() socket: Socket,
		@MessageBody() requester: any // TODO dto
	) {
		this.partyService.joinParty(user, socket, requester.id);
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('LeaveLobby')
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
		@MessageBody() data: { isReady: boolean } //TODO dto
	) {
		this.partyService.setReadyState(user, socket, data.isReady);
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('StartQueue')
	startQueue(
		@GetUser() user: User,
		@MessageBody() data: { gameMode: GameMode}
	) {
		if (data.gameMode === GameMode.OneVsOne) {
			this.queueService.join1v1Queue(user);
		}
	}
}