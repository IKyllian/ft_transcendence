import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { User } from "src/typeorm";
import { Player } from "../../player";
import { PartyJoinedSessionManager } from "./party.session";
import { Party } from "./party";
import { GlobalService } from "src/utils/global/global.service";
import { GameMode, GameType, PlayerPosition, TeamSide } from "src/utils/types/game.types";
import { SettingDto } from "../dto/game-settings.dto";
import { LobbyFactory } from "src/game/lobby/lobby.factory";
import { MatchmakingLobby } from "../matchmakingLobby";
import { QueueLobby } from "src/utils/types/types";
import { QueueService } from "../queue/queue.service";

@Injectable()
export class PartyService {
	constructor(
		public partyJoined: PartyJoinedSessionManager,
		private globalService: GlobalService,
		private lobbyFactory: LobbyFactory,
		@Inject(forwardRef(() => QueueService))
		private queueService: QueueService,
	) {}

	getPlayerInParty(id: number, player: Player[]) {
		return player.find((e) => e.user.id === id);
	}

	emitPartyUpdate(party: Party, cancelQueue = false) {
		party.players.forEach((player) => {
			this.globalService.server.to(`user-${player.user.id}`).emit('PartyUpdate', { party, cancelQueue });
		})
	}

	partyIsReady(party: Party) : boolean {
		party.players.forEach((player) => {
			if (!player.isReady && !player.isLeader) {
				throw new BadRequestException('Party is not ready !');
			}
		})
		return true;
	}

	createParty(user: User) {
		this.queueService.leaveQueue(user);
		this.partyJoined.setParty(user.id, new Party(user));
		return this.partyJoined.getParty(user.id);
	}

	joinParty(user: User, requesterId: number) {
		this.leaveParty(user);
		const party = this.partyJoined.getParty(requesterId);
		if (!party) { throw new NotFoundException('party not found'); }
		party.join(user);
		this.partyJoined.setParty(user.id, party);
		this.queueService.leaveQueue(user);
		this.emitPartyUpdate(party);
	}

	leaveParty(user: User) {
		const party = this.partyJoined.getParty(user.id);
		this.queueService.leaveQueue(user);
		if (party) {
			const player = this.getPlayerInParty(user.id, party.players);
			if (player && player.isLeader && party.players.length > 1) {
				party.players[1].isLeader = true;
				party.players.forEach((player) => player.isReady = false);
			}
			party.leave(user);
			this.emitPartyUpdate(party);
			this.partyJoined.removeParty(user.id);
			this.globalService.server.to(`user-${user.id}`).emit('PartyLeave');
		}
	}

	kickFromParty(user: User, id: number) {
		const party = this.partyJoined.getParty(user.id);
		if (party && this.getPlayerInParty(user.id, party.players).isLeader) {
			this.leaveParty(this.getPlayerInParty(id, party.players).user);
		}
	}

	partyMessage(user: User, content: string) {
		const party = this.partyJoined.getParty(user.id);
		if (party) {
			const message = party.createMessage(user, content);
			party.players.forEach((player) => {
				this.globalService.server.to(`user-${player.user.id}`).emit('NewPartyMessage', message);
			})
		}
	}

	setReadyState(user: User, isReady: boolean) {
		const party = this.partyJoined.getParty(user.id);
		if (party) {
			const player = this.getPlayerInParty(user.id, party.players);
			if (player) {
				player.isReady = isReady;
				this.emitPartyUpdate(party);
			}
		}
	}

	setTeamSide(user: User, teamSide: TeamSide) {
		const party = this.partyJoined.getParty(user.id);
		if (party) {
			const player = this.getPlayerInParty(user.id, party.players);
			if (player) {
				player.team = teamSide;
				this.emitPartyUpdate(party);
			}
		}
	}

	setPlayerPos(user: User, pos: PlayerPosition) {
		const party = this.partyJoined.getParty(user.id);
		if (party) {
			const player = this.getPlayerInParty(user.id, party.players);
			if (player) {
				player.pos = pos;
				this.emitPartyUpdate(party);
			}
		}
	}

	setSettings(user: User, settings: SettingDto) {
		const party = this.partyJoined.getParty(user.id);
		if (party && this.getPlayerInParty(user.id, party.players).isLeader) {
			party.game_settings = settings;
			this.emitPartyUpdate(party);
		}
	}

	setCustomGame(user: User, game_type: GameType) {
		const party = this.partyJoined.getParty(user.id);
		if (!party) {
			throw new BadRequestException("You need a party to play custom games");
		}
		this.partyIsReady(party);
		if (!this.getPlayerInParty(user.id, party.players).isLeader) {
			throw new BadRequestException('You are not leader');
		}

		const nbOfPayersRequired: number = game_type === GameType.Singles ? 2 : 4;
		if (party.players.length != nbOfPayersRequired) {
			throw new BadRequestException("Number of players does not fit this mode");
		}
		party.game_settings.is_ranked = false;
		party.game_settings.game_type = game_type;
		let redTeam: QueueLobby = new QueueLobby(game_type);
		let blueTeam: QueueLobby = new QueueLobby(game_type);
		party.players.forEach((player) => {
			if (player.team === TeamSide.BLUE) {
				blueTeam.addPlayer(player);
			} else {
				redTeam.addPlayer(player);
			}
		})

		if (redTeam.players.length !== blueTeam.players.length) {
			throw new BadRequestException("You must balance the teams");
		}
		if (nbOfPayersRequired === 2) {
			redTeam.players[0].pos = PlayerPosition.BACK;
			blueTeam.players[0].pos = PlayerPosition.BACK;
		} else if (nbOfPayersRequired === 4 && (redTeam.players[0].pos === redTeam.players[1].pos || blueTeam.players[0].pos === blueTeam.players[1].pos)) {
			throw new BadRequestException("Team can't be at the same position");
		}
		const match = new MatchmakingLobby(blueTeam, redTeam, party.game_settings);
		this.lobbyFactory.lobby_create(match);
	}

	setGameMode(user: User, game_mode: GameMode) {
		const party = this.partyJoined.getParty(user.id);
		if (party) {
			party.game_mode = game_mode;
			party.players.forEach((player) => {
				this.globalService.server.to(`user-${player.user.id}`).emit('GameModeUpdate', party.game_mode);
			})
		}
	}

}