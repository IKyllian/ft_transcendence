import { Socket } from "socket.io";
import { PongGame } from "../game/pong.game";
import { LobbyStatus, NewGameData, PlayerStatus } from "../types/shared.types";

export class Lobby
{
	public game_id: string;
	public creation_date: Date = new Date();
	public instance: PongGame = new PongGame(this);
	public spectators: Map<Socket['id'], Socket> = new Map<Socket['id'], Socket>();
	
	public player_A?: Socket;
	public player_A_id: string = '';
	player_A_status: PlayerStatus = PlayerStatus.Absent;
	
	public player_B?: Socket;
	public player_B_id?: string = '';
	player_B_status: PlayerStatus = PlayerStatus.Absent;
	

	constructor(
		public gamedata: NewGameData
		)
	{
		this.game_id = gamedata.game_id;
	}

	lobby_add(client: Socket, player_secret: string)
	{
//console.log("in lobby add ", player_secret);
		if (player_secret === this.gamedata.player_A_secret)
		{
			this.player_A = client;
			this.player_A_id = client.id;
			this.player_A_status = PlayerStatus.Present;
			console.log('room', this.game_id, 'player_A joined');
		}
		else if (player_secret === this.gamedata.player_B_secret)
		{
			this.player_B = client;
			this.player_B_id = client.id;
			this.player_B_status = PlayerStatus.Present;
			console.log('room', this.game_id, 'player_B joined');
		}
		else 
		{
			this.spectators.set(client['id'], client);
			console.log('room', this.game_id, 'spectator joined, total:', this.spectators.size);
		}
		client.emit('join_lobby_ok', this.game_id);
	}

	lobby_disconnect(client: Socket)
	{
		if (client.id === this.player_A_id)
		{
			//playerA left
			console.log("player A left from game ", this.game_id);
			this.player_A_status = PlayerStatus.Absent;
			this.player_A = undefined;
			this.player_A_id = '';
			//if game_has_started
			//abort game
		}
		else if (client.id === this.player_B_id)
		{
			//playerB left
			console.log("player B left from game ", this.game_id);
			this.player_B_status = PlayerStatus.Absent;
			this.player_B = undefined;
			this.player_B_id = '';
			//if game_has_started
			//abort game
		}
		else
		{
			this.spectators.delete(client.id);
		}
	}

	lobby_remove_all()
	{
		if (this.player_A_status !== PlayerStatus.Absent)
		{
			this.player_A.disconnect();
		}
		if (this.player_B_status !== PlayerStatus.Absent)
		{
			this.player_B.disconnect();
		}
		this.spectators.forEach(function(spectator)
		{
			// if (spectator instanceof Socket)
			// {
				spectator.disconnect();
			//}
		});
	}

	lobby_send_lobby_status(client: Socket)
	{
		if (this.player_A_status === PlayerStatus.Ready
			&& this.player_B_status === PlayerStatus.Ready)
		{
			client.emit('lobby_all_ready');
		}
		else
		{
			let ret: LobbyStatus =
			{
				player_A: this.player_A_status,
				player_B: this.player_B_status
			}
			client.emit('lobby_status', ret);
		}
	}

	lobby_broadcast_lobby_status()
	{
		if (this.player_A_status === PlayerStatus.Ready
			&& this.player_B_status === PlayerStatus.Ready)
		{
			this.lobby_broadcast_message('lobby_all_ready');
		}
		else
		{
			let ret: LobbyStatus =
			{
				player_A: this.player_A_status,
				player_B: this.player_B_status
			}
			this.lobby_broadcast_data('lobby_status', ret);
		}
	}

	lobby_broadcast_data(message: string, data: any)
	{
		console.log("in lobby broadcast data");
		if (this.player_A_status !== PlayerStatus.Absent)
		{
			this.player_A.emit(message, data);
			console.log('sending to player A', message);
		}
		if (this.player_B_status !== PlayerStatus.Absent)
		{
			this.player_B.emit(message, data);
			console.log('sending to player B', message);
		}
		this.spectators.forEach(function(spectator)
		{
			// if (spectator instanceof Socket)
			// {
				spectator.emit(message, data);
				console.log('sending to spectator', message);
			//}
		});
	}


	lobby_broadcast_message(message: string)
	{
		console.log("in lobby broadcast message");
		if (this.player_A_status !== PlayerStatus.Absent)
		{
			this.player_A.emit(message);
			console.log('sending to player A', message);
		}
		if (this.player_B_status !== PlayerStatus.Absent)
		{
			this.player_B.emit(message);
			console.log('sending to player B', message);
		}
		this.spectators.forEach(function(spectator)
		{
			// if (spectator instanceof Socket)
			// {
				spectator.emit(message);
				console.log('sending to spectator', message);
			//}
		});
	}

	player_ready(client: Socket)
	{
		if (client.id === this.player_A_id)
		{
			this.player_A_status = PlayerStatus.Ready;
			console.log("player A is ready ", this.game_id);
		}
		else if (client.id === this.player_B_id)
		{
			this.player_B_status = PlayerStatus.Ready;
			console.log("player B is ready ", this.game_id);
		}
		else
		{
			//report incident ?
			console.log("specytator tried to click player ready", this.game_id);
		}

		if (this.player_A_status === PlayerStatus.Ready 
			&& this.player_B_status === PlayerStatus.Ready)
		{
			//both players ready
			console.log("both players ready ", this.game_id);
			this.lobby_broadcast_message('lobby_all_ready');
		}
	}
}