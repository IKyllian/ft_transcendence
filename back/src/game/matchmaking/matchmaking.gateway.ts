import { BadRequestException, ForbiddenException, UseFilters, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { ConnectedSocket, MessageBody, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { WsJwtGuard } from "src/auth/guard/ws-jwt.guard";
import { UserIdDto } from "src/chat/gateway/dto/user-id.dto";
import { NotificationService } from "src/notification/notification.service";
import { User } from "src/typeorm";
import { UserService } from "src/user/user.service";
import { GatewayExceptionFilter } from "src/utils/exceptions/filter/Gateway.filter";
import { AuthenticatedSocket } from "src/utils/types/auth-socket";
import { GameMode, PlayerPosition, TeamSide } from "src/utils/types/game.types";
import { notificationType } from "src/utils/types/types";
import { LobbyFactory } from "../lobby/lobby.factory";
import { IsReadyDto } from "./dto/boolean.dto";
import { SettingDto } from "./dto/game-settings.dto";
import { PartyMessageDto } from "./dto/party-message.dto";
import { StartQueueDto } from "./dto/start-queue.dto";
import { PartyService } from "./party/party.service";
import { QueueService } from "./queue/queue.service";

@UseFilters(GatewayExceptionFilter)
@UsePipes(new ValidationPipe())
@WebSocketGateway()
export class MatchmakingGateway implements OnGatewayDisconnect {
	@WebSocketServer() server: Server;

	constructor(
		private userService: UserService,
		private partyService: PartyService,
		private queueService: QueueService,
		private notifService: NotificationService,
		private lobbyFactory: LobbyFactory,
	) {}

	handleDisconnect(socket: AuthenticatedSocket) {
		if (socket.user) {
			this.queueService.leaveQueue(socket.user);
		}
	}

	/**
	 *
	 * PARTY EVENTS
	 *
	 */
	@UseGuards(WsJwtGuard)
	@SubscribeMessage('PartyInvite')
	async sendGameInvite(
		@ConnectedSocket() socket: AuthenticatedSocket,
		@MessageBody() dto: UserIdDto,
	) {
		if (!this.partyService.partyJoined.getParty(socket.user.id)) {
			const party = this.partyService.createParty(socket.user);
			this.server.to(`user-${socket.user.id}`).emit("PartyUpdate", { party, cancelQueue: true });
		}
		const notif = await this.notifService.createPartyInviteNotif(socket.user, dto.id);
		socket.emit('SendConfirm', "Invitation send");
		socket.to(`user-${dto.id}`).emit('NewPartyInvite', notif);
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('CreateParty')
	createLobby(
		@ConnectedSocket() socket: AuthenticatedSocket,
	) {
		if (!this.partyService.partyJoined.getParty(socket.user.id)) {
			const party = this.partyService.createParty(socket.user);
			this.server.to(`user-${socket.user.id}`).emit("PartyUpdate", { party, cancelQueue: true });
		}
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('JoinParty')
	async joinLobby(
		@ConnectedSocket() socket: AuthenticatedSocket,
		@MessageBody() requester: UserIdDto,
	) {
		const inviteFound = await this.notifService.findOne({
			where: {
				addressee: { id: socket.user.id },
				requester: { id: requester.id },
				type: notificationType.PARTY_INVITE,
			}
		});
		if (!inviteFound) {
			throw new ForbiddenException('You are not invited to this party');
		}
		this.partyService.joinParty(socket.user, requester.id);
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('LeaveParty')
	leaveLobby(
		@ConnectedSocket() socket: AuthenticatedSocket,
	) {
		this.partyService.leaveParty(socket.user);
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('KickParty')
	kickFromLobby(
		@ConnectedSocket() socket: AuthenticatedSocket,
		@MessageBody() data: UserIdDto,
	) {
		this.partyService.kickFromParty(socket.user, data.id);
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('NewPartyMessage')
	newPartyMessage(
		@ConnectedSocket() socket: AuthenticatedSocket,
		@MessageBody() data: PartyMessageDto,
	) {
		this.partyService.partyMessage(socket.user, data.content);
	}


	/**
	 *
	 * PARTY GAME SETTINGS EVENTS
	 *
	 */
	@UseGuards(WsJwtGuard)
	@SubscribeMessage('SetReadyState')
	setReadyState(
		@ConnectedSocket() socket: AuthenticatedSocket,
		@MessageBody() data: IsReadyDto,
	) {
		this.partyService.setReadyState(socket.user, data.isReady);
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('SetTeamSide')
	setTeamSide(
		@ConnectedSocket() socket: AuthenticatedSocket,
		@MessageBody() data: { team: TeamSide },
	) {
		this.partyService.setTeamSide(socket.user, data.team);
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('SetPlayerPos')
	setPlayerPos(
		@ConnectedSocket() socket: AuthenticatedSocket,
		@MessageBody() data: { pos: PlayerPosition }, //TODO DTO
	) {
		this.partyService.setPlayerPos(socket.user, data.pos);
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('SetSettings')
	setSetting(
		@MessageBody() settings: SettingDto,
		@ConnectedSocket() socket: AuthenticatedSocket,
	) {
		this.partyService.setSettings(socket.user, settings);
		socket.emit('SendConfirm', "Submitted");
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('SetGameMode')
	setGameMode(
		@ConnectedSocket() socket: AuthenticatedSocket,
		@MessageBody() game_mode: GameMode,
	) {
		this.partyService.setGameMode(socket.user, game_mode)
	}

	/**
	 *
	 * QUEUE EVENTS
	 *
	 */

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('StartQueue')
	async startQueue(
		@ConnectedSocket() socket: AuthenticatedSocket,
		@MessageBody() data: StartQueueDto,
	) {
		let in_game: Boolean = false;
		const party = this.partyService.partyJoined.getParty(socket.user.id);
		if (party) {
			for (let player of party.players) {
				player.user = await this.userService.findOne({ where: { id: player.user.id }});
				if (player.user.in_game_id) {
					in_game = true;
				}
			};
			if (in_game) {
				throw new BadRequestException("Someone is already in game");
			}
		} else if (socket.user.in_game_id) {
			throw new BadRequestException("You are already in game");
		}
		if (data.isRanked) {
			this.queueService.joinQueue(socket.user, data.gameType);
		} else {
			this.partyService.setCustomGame(socket.user, data.gameType);
		}
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('StopQueue')
	stopQueue(
		@ConnectedSocket() socket: AuthenticatedSocket,
	) {
		this.queueService.leaveQueue(socket.user);
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('get_gameinfo')
	async onGetGameInfo(
		@ConnectedSocket() client: AuthenticatedSocket,
		@MessageBody() game_id: string
	) {
		this.lobbyFactory.get_game_info(client, game_id);
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('get_clientinfo')
	async onGetClientInfo(
		@ConnectedSocket() client: AuthenticatedSocket,
		@MessageBody() id: number 
	) {
		this.lobbyFactory.get_client_info(client, id);
	}
}