import { Socket } from "socket.io";
import { GameState, LobbyStatus, NewGameData, PlayerInput, PlayerStatus, PlayerType, RoundSetup } from "src/utils/types/game.types";
import { PongGame } from "../pong/pong.game";
import { LobbyFactory } from "./lobby.factory";

export class Lobby
{
	public game_id: string;
	public creation_date: Date = new Date();
	public game: PongGame = new PongGame(this);
	public spectators: Map<Socket['id'], Socket> = new Map<Socket['id'], Socket>();
	
	public player_A?: Socket;
	public player_A_id: string = '';
	player_A_status: PlayerStatus = PlayerStatus.Absent;
	
	public player_B?: Socket;
	public player_B_id?: string = '';
	player_B_status: PlayerStatus = PlayerStatus.Absent;
	
	already_started: boolean = false;
//	already_playing: boolean = false;
	already_finished: boolean = false;

	constructor(
		public gamedata: NewGameData,
		private readonly factory: LobbyFactory
		)
	{
		this.game_id = gamedata.game_id;
	}

	game_set_finished()
	{
		this.already_finished = true;
	}

	lobby_add(client: Socket, player_secret: string)
	{
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
		//moved to factory to be in same place than join fail
		// client.emit('lobby_join_response', true);
	}

	lobby_disconnect(client: Socket)
	{
		if (client.id === this.player_A_id)
		{
			console.log("player A left from game ", this.game_id);
			this.player_A_status = PlayerStatus.Absent;
			this.player_A = undefined;
			this.player_A_id = '';
			//if game_has_started
			//start timer for abort game
		}
		else if (client.id === this.player_B_id)
		{
			//playerB left
			console.log("player B left from game ", this.game_id);
			this.player_B_status = PlayerStatus.Absent;
			this.player_B = undefined;
			this.player_B_id = '';
			//if game_has_started
			//start timer for abort game
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
			spectator.disconnect();
		});
	}

	lobby_send_lobby_status(client: Socket)
	{
		if(this.already_finished)
		{
			let gamestate: GameState = this.game.core.get_gamestate();
			client.emit('match_winner', gamestate.result);
		}
		else if (this.player_A_status === PlayerStatus.Ready
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
		if (this.player_A_status !== PlayerStatus.Absent)
		{
			this.player_A.emit(message, data);
		}
		if (this.player_B_status !== PlayerStatus.Absent)
		{
			this.player_B.emit(message, data);
		}
		this.spectators.forEach(function(spectator)
		{
			spectator.emit(message, data);
		});
	}


	lobby_broadcast_message(message: string)
	{
		console.log("in lobby broadcast message");
		if (this.player_A_status !== PlayerStatus.Absent)
		{
			this.player_A.emit(message);
		//	console.log('sending to player A', message);
		}
		if (this.player_B_status !== PlayerStatus.Absent)
		{
			this.player_B.emit(message);
	//		console.log('sending to player B', message);
		}
		this.spectators.forEach(function(spectator)
		{
			spectator.emit(message);
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
			if (!this.already_started)
			{
				this.game.start();
				this.already_started = true;
			}

			// setTimeout(function(){
			// 	this.already_playing = true;
			// }, 3000);

		}
	}

	game_receive_input(client: Socket, input: PlayerInput)
	{
		if ((client.id === this.player_A_id && input.playertype === PlayerType.Player_A)
			||(client.id === this.player_B_id && input.playertype === PlayerType.Player_B))
			{
				this.game.core.append_input(input);
			}
			else
			{
//TODO better logging
				console.log("input incidend");
			}
	}


	game_send_round_setup(client: Socket)
	{
		let ret: RoundSetup;

		ret = this.game.core.get_round_setup();
		client.emit('round_setup', ret);
	}

}