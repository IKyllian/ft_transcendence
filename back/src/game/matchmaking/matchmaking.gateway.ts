import { ForbiddenException, UnauthorizedException, UseFilters, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { ConnectedSocket, MessageBody, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { WsJwtGuard } from "src/auth/guard/ws-jwt.guard";
import { UserIdDto } from "src/chat/gateway/dto/user-id.dto";
import { NotificationService } from "src/notification/notification.service";
import { TaskScheduler } from "src/task-scheduling/task.module";
import { TaskService } from "src/task-scheduling/task.service";
import { User } from "src/typeorm";
import { GetUser } from "src/utils/decorators";
import { GatewayExceptionFilter } from "src/utils/exceptions/filter/Gateway.filter";
import { AuthenticatedSocket } from "src/utils/types/auth-socket";
import { GameMode } from "src/utils/types/game.types";
import { notificationType } from "src/utils/types/types";
import { ConnectionOptionsReader } from "typeorm";
import { UserSessionManager } from "../user.session";
import { IsReadyDto } from "./dto/boolean.dto";
import { IdDto } from "./dto/id.dto";
import { PartyService } from "./party/party.service";
import { QueueService } from "./queue/queue.service";

@UseFilters(GatewayExceptionFilter)
@UsePipes(new ValidationPipe())
@WebSocketGateway()
export class MatchmakingGateway implements OnGatewayDisconnect {
	@WebSocketServer() server: Server;

	constructor(
		private readonly userSession: UserSessionManager,
		private partyService: PartyService,
		private queueService: QueueService,
		private notifService: NotificationService,
		private taskScheduler: TaskService,
	) {}


	afterInit(server: Server)
	{
	  this.partyService.server = server;
	  this.taskScheduler.server = server;
	}

	handleDisconnect(socket: AuthenticatedSocket) {
		if (socket.user) {
			this.queueService.leaveQueue(socket.user);
		}
	}


	@UseGuards(WsJwtGuard)
	@SubscribeMessage('PartyInvite')
	async sendGameInvite(
		@GetUser() user: User,
		@ConnectedSocket() socket: Socket,
		@MessageBody() dto: UserIdDto,
	) {
		console.log("party invite")
		if (!this.partyService.partyJoined.getParty(user.id)) {
			const party = this.partyService.createParty(user);
			socket.emit("PartyCreated", party);
			socket.join(`party-${party.id}`)
		}
		const notif = await this.notifService.createPartyInviteNotif(user, dto.id);
		socket.to(`user-${dto.id}`).emit('NewPartyInvite', notif);
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('CreateParty')
	createLobby(
		@GetUser() user: User,
	) {
		if (!this.partyService.partyJoined.getParty(user.id)) {
			const party = this.partyService.createParty(user);
			this.server.to(`user-${user.id}`).emit("PartyUpdate", party);
		}
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('JoinParty')
	async joinLobby(
		@GetUser() user: User,
		@MessageBody() requester: UserIdDto,
	) {
		const inviteFound = await this.notifService.findOne({
			where: {
				addressee: { id: user.id },
				requester: { id: requester.id },
				type: notificationType.PARTY_INVITE,
			}
		});
		if (!inviteFound) {
			throw new ForbiddenException('You are not invited to this party');
		}
		this.partyService.joinParty(user, requester.id);
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('LeaveParty')
	leaveLobby(
		@GetUser() user: User,
	) {
		this.partyService.leaveParty(user);
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('KickParty')
	kickFromLobby(
		@GetUser() user: User,
		@MessageBody() data: UserIdDto,
	) {
		this.partyService.kickFromParty(user, data.id);
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('SetReadyState')
	setReadyState(
		@GetUser() user: User,
		@MessageBody() data: IsReadyDto,
	) {
		console.log('set Ready', data)
		this.partyService.setReadyState(user, data.isReady);
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
	@SubscribeMessage('StopQueue')
	stopQueue(
		@GetUser() user: User,
	) {
			this.queueService.leaveQueue(user);
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('test2')
	test2(@ConnectedSocket() socket: AuthenticatedSocket) {
		console.log(socket.id)
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('test')
	async test(@ConnectedSocket() socket: AuthenticatedSocket, @GetUser() user: User) {
		// console.log(socket)
		const socketConnected = await this.server.sockets.allSockets();
		const mySocket: Map<string, AuthenticatedSocket> = this.server.sockets.sockets as Map<string, AuthenticatedSocket>;
		// console.log(mySocket)
		// const sockets = await socket.in("user-8").fetchSockets() as unknown as AuthenticatedSocket[];
		const userIdInRoom = (await socket.in("user-8").fetchSockets() as unknown as AuthenticatedSocket[]).map(e => e.user.id)
		// const userIdInChan = sockets.map(e => e.user.id)
		console.log(userIdInRoom)
	}
}