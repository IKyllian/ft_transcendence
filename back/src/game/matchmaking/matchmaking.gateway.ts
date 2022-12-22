import { BadRequestException, ForbiddenException, UseFilters, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { ConnectedSocket, MessageBody, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { WsJwtGuard } from "src/auth/guard/ws-jwt.guard";
import { UserIdDto } from "src/chat/gateway/dto/user-id.dto";
import { NotificationService } from "src/notification/notification.service";
import { User } from "src/typeorm";
import { UserService } from "src/user/user.service";
import { GetUser } from "src/utils/decorators";
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
		@GetUser() user: User,
		@ConnectedSocket() socket: Socket,
		@MessageBody() dto: UserIdDto,
	) {
		if (!this.partyService.partyJoined.getParty(user.id)) {
			const party = this.partyService.createParty(user);
			this.server.to(`user-${user.id}`).emit("PartyUpdate", { party, cancelQueue: true });
		}
		const notif = await this.notifService.createPartyInviteNotif(user, dto.id);
		socket.emit('SendConfirm', "Invitation send");
		socket.to(`user-${dto.id}`).emit('NewPartyInvite', notif);
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('CreateParty')
	createLobby(
		@GetUser() user: User,
	) {
		if (!this.partyService.partyJoined.getParty(user.id)) {
			const party = this.partyService.createParty(user);
			this.server.to(`user-${user.id}`).emit("PartyUpdate", { party, cancelQueue: true });
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
	@SubscribeMessage('NewPartyMessage')
	newPartyMessage(
		@GetUser() user: User,
		@MessageBody() data: PartyMessageDto,
	) {
		this.partyService.partyMessage(user, data.content);
	}


	/**
	 *
	 * PARTY GAME SETTINGS EVENTS
	 *
	 */
	@UseGuards(WsJwtGuard)
	@SubscribeMessage('SetReadyState')
	setReadyState(
		@GetUser() user: User,
		@MessageBody() data: IsReadyDto,
	) {
		this.partyService.setReadyState(user, data.isReady);
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('SetTeamSide')
	setTeamSide(
		@GetUser() user: User,
		@MessageBody() data: { team: TeamSide },
	) {
		this.partyService.setTeamSide(user, data.team);
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('SetPlayerPos')
	setPlayerPos(
		@GetUser() user: User,
		@MessageBody() data: { pos: PlayerPosition }, //TODO DTO
	) {
		this.partyService.setPlayerPos(user, data.pos);
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('SetSettings')
	setSetting(
		@GetUser() user: User,
		@MessageBody() settings: SettingDto,
		@ConnectedSocket() socket: AuthenticatedSocket,
	) {
		this.partyService.setSettings(user, settings);
		socket.emit('SendConfirm', "Submitted");
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('SetGameMode')
	setGameMode(
		@GetUser() user: User,
		@MessageBody() game_mode: GameMode,
	) {
		this.partyService.setGameMode(user, game_mode)
	}

	/**
	 *
	 * QUEUE EVENTS
	 *
	 */

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('StartQueue')
	async startQueue(
		@GetUser() user: User,
		@MessageBody() data: StartQueueDto,
	) {
		let in_game: Boolean = false;
		const party = this.partyService.partyJoined.getParty(user.id);
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
		} else if (user.in_game_id) {
			throw new BadRequestException("You are already in game");
		}
		if (data.isRanked) {
			this.queueService.joinQueue(user, data.gameType);
		} else {
			this.partyService.setCustomGame(user, data.gameType);
		}
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('StopQueue')
	stopQueue(
		@GetUser() user: User,
	) {
		this.queueService.leaveQueue(user);
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