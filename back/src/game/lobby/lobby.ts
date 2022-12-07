import { Socket } from "socket.io";
import { AuthenticatedSocket } from "src/utils/types/auth-socket";
import { GameType, TeamSide, PlayerPosition, PlayerStatus, GameSettings, GameState, LobbyStatus, PlayerInput, PlayerType, RoundSetup } from "src/utils/types/game.types";
import { setTimeout } from "timers/promises";
import { MatchmakingLobby } from "../matchmaking/matchmakingLobby";
import { PongGame } from "../pong/pong.game";
import { LobbyFactory } from "./lobby.factory";

export class Lobby
{
	public game_type: GameType = GameType.Singles;
	public creation_date: Date = new Date();
	public game: PongGame = new PongGame(this.lobby_data.game_settings, this);
	public spectators: Map<Socket['id'], Socket> = new Map<Socket['id'], Socket>();
	public playerSockets: AuthenticatedSocket[] = [];

	already_started: boolean = false;
	already_finished: boolean = false;

	timeout: any;

	constructor(
		public lobby_data: MatchmakingLobby,
		public game_id: string,
		readonly factory: LobbyFactory
		)
	{
		this.game_type = lobby_data.game_settings.game_type;

	}

	game_set_finished()
	{
		this.already_finished = true;
	}

	lobby_add(client: AuthenticatedSocket)
	{
		let is_player: boolean = false;
		this.lobby_data.players.forEach((player) => {
			if (player.user.id === client.user.id) {
				this.playerSockets.push(client);
				is_player = true;
			}
		})
		if (!is_player) {
			this.spectators.set(client.id, client);
			console.log('room', this.game_id, 'spectator joined, total:', this.spectators.size);
		}

		if (this.already_started)
		{
			client.emit('lobby_all_ready');
			return;
		}

		if (this.playerSockets.length === this.lobby_data.players.length) {
			console.log("all players ready ", this.game_id);
			this.lobby_broadcast_message('lobby_all_ready');
			if (!this.already_started)
			{
				this.game.start();
				this.already_started = true;
				//cancel timeout vu que tout le monde est la
			}
		}
	}

	lobby_disconnect(client: Socket)
	{
	
		if (this.playerSockets.find((socket) => socket.id === client.id))
			this.playerSockets = this.playerSockets.filter((socket) => socket.id !== client.id);
		else
			this.spectators.delete(client.id);
	}

	lobby_send_lobby_status(client: AuthenticatedSocket)
	{
		if(this.already_finished)
		{
			let gamestate: GameState = this.game.core.get_gamestate();
			client.emit('match_winner', gamestate.result);
		}
		else if (this.playerSockets.length === this.lobby_data.players.length) {
			client.emit('lobby_all_ready');
		}
	}

	lobby_broadcast_lobby_status()
	{
		if(this.already_finished)
		{
			let gamestate: GameState = this.game.core.get_gamestate();
			this.lobby_broadcast_data('match_winner', gamestate.result);
		}
		else if (this.playerSockets.length === this.lobby_data.players.length) {
			this.lobby_broadcast_message('lobby_all_ready');
		}
	}

	lobby_broadcast_data(message: string, data: any)
	{
		this.playerSockets.forEach((socket) => {
			socket.emit(message, data);
		})

		this.spectators.forEach(function(spectator)
		{
			spectator.emit(message, data);
		});
	}


	lobby_broadcast_message(message: string)
	{
		this.playerSockets.forEach((socket) => {
			socket.emit(message);
		})
		this.spectators.forEach(function(spectator)
		{
			spectator.emit(message);
		});
	}

	game_receive_input(client: AuthenticatedSocket, input: PlayerInput)
	{
		const player = this.lobby_data.players.find((player) => player.user.id === client.user.id);

		if (player && this.convert_player_enums(player.team, player.pos) === input.player_type)
		{
			this.game.core.append_input(input);
		}
		else
		{
			// console.log("input incidend", this.game_id);
		}
	}

	game_send_round_setup(client: AuthenticatedSocket)
	{
		let ret: RoundSetup;

		ret = this.game.core.get_round_setup();
		client.emit('round_setup', ret);
	}

    convert_player_enums(team: TeamSide, pos: PlayerPosition): PlayerType
    {
        if (team === TeamSide.BLUE)
        {
            if (pos === PlayerPosition.BACK)
                return PlayerType.TeamBlue_Back;
            else
                return PlayerType.TeamBlue_Front;
        }
        else
        {
            if (pos === PlayerPosition.BACK)
                return PlayerType.TeamRed_Back
            else
                return PlayerType.TeamRed_Front
        }
    }


}