import { io, Socket } from "socket.io-client";
import { LobbyStatus, PlayersLobbyData } from './types/shared.types';

export default class ClientSocketManager
{
	private socket? : Socket;
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
//TODO retry until success
		this.socket = io('http://localhost:6161');
	}

	
	join_lobby = (lobbydata: PlayersLobbyData) =>
	{
		if (this.socket instanceof Socket)
		{
			this.socket.emit('user_join_lobby', lobbydata);
		}
	}

	request_lobby_status = (game_id: string) =>
	{
		if (this.socket instanceof Socket)
		{
			this.socket.emit('user_lobby_request_status', game_id);
		}
	}


	send_ready = () =>
	{
		if (this.socket instanceof Socket)
		{
			this.socket.emit('user_is_ready');
		}
	}

	
	private init_listen = () =>
	{

		if (this.socket instanceof Socket)
		{
			this.socket.on('join_lobby_ok', this.onLobbyJoinOk.bind(this));
			this.socket.on('lobby_all_ready', this.onLobbyAllReady.bind(this));
			this.socket.on('lobby_status', this.onLobbyStatus.bind(this));
		}
	}

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


	print_test = () =>
	{
		console.log('print_test', this.socket?.id);
	}

}