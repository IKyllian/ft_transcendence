import { io, Socket } from "socket.io-client";
import { EndResult, GameState, LobbyStatus, PlayerInput, PlayersLobbyData, RoundSetup } from './types/shared.types';

export default class ClientSocketManager
{
	private socket?: Socket;
	private lobby_triggers: any;
	private pong_triggers: any;

	constructor()
	{
		this.attempt_connection();
		this.init_listen();
    }

    set_lobby_triggers(data: any): void
	{
        this.lobby_triggers = data;
    }

    set_pong_triggers(data: any): void
	{
        this.pong_triggers = data;
    }

	private attempt_connection()
	{
//TODO retry until success ? deja le cas auto ?
		this.socket = io('http://localhost:6161');
	}

	//Listens init
	
	private init_listen = () =>
	{
		
		if (this.socket instanceof Socket)
		{
			//Lobby
			this.socket.on('join_lobby_ok', this.onLobbyJoinOk.bind(this));
			this.socket.on('lobby_all_ready', this.onLobbyAllReady.bind(this));
			this.socket.on('lobby_status', this.onLobbyStatus.bind(this));
			//Game
			this.socket.on('game_state', this.onGameGetState.bind(this));
			this.socket.on('round_setup', this.onGameGetRoundSetup.bind(this));
			this.socket.on('match_winner', this.onGameGetMatchWinner.bind(this));

		}
	}

	//Lobby Emits
	
	lobby_send_join = (lobbydata: PlayersLobbyData) =>
	{
		if (this.socket instanceof Socket)
		{
			this.socket.emit('user_join_lobby', lobbydata);
		}
	}

	lobby_send_request_status = (game_id: string) =>
	{
		if (this.socket instanceof Socket)
		{
			this.socket.emit('user_lobby_request_status', game_id);
		}
	}

	lobby_send_ready = (game_id: string) =>
	{
		if (this.socket instanceof Socket)
		{
			this.socket.emit('user_is_ready', game_id);
		}
	}

	//Lobby Listens

	onLobbyJoinOk = (message: string) =>
	{
		console.log('received lobby ok', message);
	}

	onLobbyAllReady = () =>
	{
		console.log('received lobby_all_ready');
		this.lobby_triggers.ready_to_go();
	}

	onLobbyStatus = (new_status: LobbyStatus) =>
	{
		console.log('received lobby_status');
		this.lobby_triggers.update_lobby_status(new_status);	
	}

	//Game Emits

	game_send_input = (game_id: string, input: PlayerInput) =>
	{
		if (this.socket instanceof Socket)
		{
			this.socket.emit('user_game_input', game_id, input);
		}
	}

	game_get_round_setup = (game_id: string) =>
	{
		if (this.socket instanceof Socket)
		{
			this.socket.emit('user_game_get_round_setup', game_id);
		}
	}

	//Game Listens

	onGameGetState = (gamestate: GameState) =>
	{
		this.pong_triggers?.append_server_gamestate(gamestate);
	}

	onGameGetRoundSetup = (round_setup: RoundSetup) =>
	{
		this.lobby_triggers?.store_round_setup(round_setup);
		this.pong_triggers?.apply_round_setup(round_setup);
	}

	onGameGetMatchWinner = (result: EndResult) =>
	{
		this.pong_triggers?.game_end(result);
	}
}