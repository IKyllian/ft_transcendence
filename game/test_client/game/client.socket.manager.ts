import { io, Socket } from "socket.io-client";
import { PlayersLobbyData } from './types/shared.types';

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
		// let lobbydata: PlayersLobbyData = 
		// {
		// 	player_secret: player_secret,
		// 	game_id: game_id
		// };
		if (this.socket instanceof Socket)
		{
			this.socket.emit('user_join_lobby', lobbydata);
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



	print_test = () =>
	{
		console.log('print_test', this.socket?.id);
	}

}