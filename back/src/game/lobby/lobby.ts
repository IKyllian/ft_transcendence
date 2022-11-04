import { Socket } from "socket.io";
import { AuthenticatedSocket } from "src/utils/types/auth-socket";
import { GameType, PlayerStatus, GameSettings, GameState, LobbyStatus, PlayerInput, PlayerType, RoundSetup, MatchmakingLobby } from "src/utils/types/game.types";
import { PongGame } from "../pong/pong.game";
import { LobbyFactory } from "./lobby.factory";

export class Lobby
{
	//public game_id: string;
	public game_type: GameType = GameType.Singles;
	public creation_date: Date = new Date();
	public game: PongGame = new PongGame(this.lobby_data.game_settings, this.lobby_data.gameMode, this);


	//changer les spects en room
	public spectators: Map<Socket['id'], Socket> = new Map<Socket['id'], Socket>();
	

	public Player_A_Back?: AuthenticatedSocket;
	// public Player_A_Back_id: string = '';
	Player_A_Back_status: PlayerStatus = PlayerStatus.Absent;


	public Player_A_Front?: AuthenticatedSocket;
	// public Player_A_Front_id: string = '';
	Player_A_Front_status: PlayerStatus = PlayerStatus.Absent;

	public Player_B_Front?: AuthenticatedSocket;
	// public Player_B_Front_id: string = '';
	Player_B_Front_status: PlayerStatus = PlayerStatus.Absent;

	public Player_B_Back?: AuthenticatedSocket;
	// public Player_B_Back_id: string = '';
	Player_B_Back_status: PlayerStatus = PlayerStatus.Absent;

	
	already_started: boolean = false;
	already_finished: boolean = false;



	constructor(
		public lobby_data: MatchmakingLobby,
		public game_id: string,
	//	public game_settings: GameSettings,
		readonly factory: LobbyFactory
		)
	{
	//	this.game_id = gamedata.game_id;
		this.game_type = lobby_data.game_settings.game_type;
	}




	// constructor(
	// 	public gamedata: NewGameData,
	// 	public game_settings: GameSettings,
	// 	readonly factory: LobbyFactory
	// 	)
	// {
	// 	this.game_id = gamedata.game_id;
	// 	this.game_type = gamedata.game_settings.game_type;
	// }

	game_set_finished()
	{
		this.already_finished = true;
	}

	lobby_add(client: AuthenticatedSocket)
	{
		if (client.user.id === this.lobby_data.Player_A_Back.user.id)
		{
			this.Player_A_Back_status = PlayerStatus.Ready;
			this.Player_A_Back = client;
			console.log('room', this.game_id, 'Player_A_Back joined');
		}
		else if (client.user.id === this.lobby_data.Player_B_Back.user.id)
		{
			this.Player_B_Back_status = PlayerStatus.Ready;
			this.Player_B_Back = client;
			console.log('room', this.game_id, 'player_B_Back joined');
		}
		else if(this.game_type === GameType.Doubles)
		{
			if (client.user.id === this.lobby_data.Player_A_Front.user.id)
			{
				this.Player_A_Front_status = PlayerStatus.Ready;
				this.Player_A_Front = client;
				console.log('room', this.game_id, 'Player_A_Front joined');
			}
			else if (client.user.id === this.lobby_data.Player_B_Front.user.id)
			{
				this.Player_B_Front_status = PlayerStatus.Ready;
				this.Player_B_Front = client;
				console.log('room', this.game_id, 'player_B_Front joined');
			}

		}
		else 
		{
			this.spectators.set(client.id, client);
			console.log('room', this.game_id, 'spectator joined, total:', this.spectators.size);
		}



		if ((this.Player_A_Back_status === PlayerStatus.Ready 
			&& this.Player_B_Back_status === PlayerStatus.Ready
			&& this.game_type === GameType.Singles)
			||
			(this.Player_A_Back_status === PlayerStatus.Ready
			&& this.Player_B_Back_status === PlayerStatus.Ready
			&&this.Player_A_Front_status === PlayerStatus.Ready
			&& this.Player_B_Front_status === PlayerStatus.Ready
			&& this.game_type === GameType.Doubles))
		{
			console.log("all players ready ", this.game_id);
			this.lobby_broadcast_message('lobby_all_ready');
			if (!this.already_started)
			{
				this.game.start();
				this.already_started = true;
			}
		}
	}

	lobby_disconnect(client: Socket)
	{
		if (client.id === this.Player_A_Back.id)
		{
			console.log("player_A_Back left from game ", this.game_id);
			this.Player_A_Back_status = PlayerStatus.Absent;
			this.Player_A_Back = undefined;
		//	this.Player_A_Back_id = '';
			//if game_has_started
			//start timer for abort game
		}
		else if (client.id === this.Player_B_Back.id)
		{
			//playerB left
			console.log("player_B_Back from game ", this.game_id);
			this.Player_B_Back_status = PlayerStatus.Absent;
			this.Player_B_Back = undefined;
			//this.Player_B_Back_id = '';
			//if game_has_started
			//start timer for abort game
		}
		else if(this.game_type === GameType.Doubles)
		{

			if (client.id === this.Player_A_Front.id)
			{
				console.log("player_A_Front left from game ", this.game_id);
				this.Player_A_Front_status = PlayerStatus.Absent;
				this.Player_A_Front = undefined;
				//this.Player_A_Front_id = '';
				//if game_has_started
				//start timer for abort game
			}
			else if (client.id === this.Player_B_Front.id)
			{
				//playerB left
				console.log("player_B_Front from game ", this.game_id);
				this.Player_B_Front_status = PlayerStatus.Absent;
				this.Player_B_Front = undefined;
				//this.Player_B_Front_id = '';
				//if game_has_started
				//start timer for abort game
			}
		}
		else
		{
			this.spectators.delete(client.id);
		}
	}

	// lobby_remove_all()
	// {
	// 	if (this.player_A_status !== PlayerStatus.Absent)
	// 	{
	// 		this.player_A.disconnect();
	// 	}
	// 	if (this.player_B_status !== PlayerStatus.Absent)
	// 	{
	// 		this.player_B.disconnect();
	// 	}
	// 	this.spectators.forEach(function(spectator)
	// 	{
	// 		spectator.disconnect();
	// 	});
	// }

	lobby_send_lobby_status(client: AuthenticatedSocket)
	{
		if(this.already_finished)
		{
			let gamestate: GameState = this.game.core.get_gamestate();
			client.emit('match_winner', gamestate.result);
		}
		else if (this.Player_A_Back_status === PlayerStatus.Ready
			&& this.Player_B_Back_status === PlayerStatus.Ready
			&& this.game_type === GameType.Singles)
		{
			client.emit('lobby_all_ready');
		}
		else if (this.Player_A_Back_status === PlayerStatus.Ready
			&& this.Player_B_Back_status === PlayerStatus.Ready
			&&this.Player_A_Front_status === PlayerStatus.Ready
			&& this.Player_B_Front_status === PlayerStatus.Ready
			&& this.game_type === GameType.Doubles)
		{
			client.emit('lobby_all_ready');
		}
		else
		{
			let ret: LobbyStatus =
			{
				Player_A_Back: this.Player_A_Back_status,
				Player_A_Front: this.Player_A_Front_status,
				Player_B_Front: this.Player_B_Front_status,
				Player_B_Back: this.Player_B_Back_status
			}
			client.emit('lobby_status', ret);
		}
	}

	lobby_broadcast_lobby_status()
	{

		if(this.already_finished)
		{
			let gamestate: GameState = this.game.core.get_gamestate();
			this.lobby_broadcast_data('match_winner', gamestate.result);
		}
		else if (this.Player_A_Back_status === PlayerStatus.Ready
			&& this.Player_B_Back_status === PlayerStatus.Ready
			&& this.game_type === GameType.Singles)
		{
			this.lobby_broadcast_message('lobby_all_ready');
		}
		else if (this.Player_A_Back_status === PlayerStatus.Ready
			&& this.Player_B_Back_status === PlayerStatus.Ready
			&&this.Player_A_Front_status === PlayerStatus.Ready
			&& this.Player_B_Front_status === PlayerStatus.Ready
			&& this.game_type === GameType.Doubles)
		{
			this.lobby_broadcast_message('lobby_all_ready');
		}
		else
		{
			let ret: LobbyStatus =
			{
				Player_A_Back: this.Player_A_Back_status,
				Player_A_Front: this.Player_A_Front_status,
				Player_B_Front: this.Player_B_Front_status,
				Player_B_Back: this.Player_B_Back_status
			}
			this.lobby_broadcast_data('lobby_status', ret);
		}
	}

	lobby_broadcast_data(message: string, data: any)
	{
		if (this.Player_A_Back_status !== PlayerStatus.Absent)
		{
			this.Player_A_Back.emit(message, data);
		}
		if (this.Player_B_Back_status !== PlayerStatus.Absent)
		{
			this.Player_B_Back.emit(message, data);
		}

		if(this.game_type === GameType.Doubles)
		{
			if (this.Player_A_Front_status !== PlayerStatus.Absent)
			{
				this.Player_A_Front.emit(message, data);
			}
			if (this.Player_B_Front_status !== PlayerStatus.Absent)
			{
				this.Player_B_Front.emit(message, data);
			}
		}

		this.spectators.forEach(function(spectator)
		{
			spectator.emit(message, data);
		});
	}


	lobby_broadcast_message(message: string)
	{
		if (this.Player_A_Back_status !== PlayerStatus.Absent)
		{
			this.Player_A_Back.emit(message);
		}
		if (this.Player_B_Back_status !== PlayerStatus.Absent)
		{
			this.Player_B_Back.emit(message);
		}

		if(this.game_type === GameType.Doubles)
		{
			if (this.Player_A_Front_status !== PlayerStatus.Absent)
			{
				this.Player_A_Front.emit(message);
			}
			if (this.Player_B_Front_status !== PlayerStatus.Absent)
			{
				this.Player_B_Front.emit(message);
			}
		}

		this.spectators.forEach(function(spectator)
		{
			spectator.emit(message);
		});

	}

	// player_ready(client: Socket)
	// {
	// 	if (client.id === this.Player_A_Back_id)
	// 	{
	// 		this.Player_A_Back_status = PlayerStatus.Ready;
	// 		console.log("player A_Back is ready ", this.game_id);
	// 	}
	// 	else if (client.id === this.Player_B_Back_id)
	// 	{
	// 		this.Player_B_Back_status = PlayerStatus.Ready;
	// 		console.log("player B_Back is ready ", this.game_id);
	// 	}
	// 	else if (this.game_type === GameType.Doubles)
	// 	{
	// 		if (client.id === this.Player_A_Front_id)
	// 		{
	// 			this.Player_A_Front_status = PlayerStatus.Ready;
	// 			console.log("player A_Front is ready ", this.game_id);
	// 		}
	// 		else if (client.id === this.Player_B_Front_id)
	// 		{
	// 			this.Player_B_Front_status = PlayerStatus.Ready;
	// 			console.log("player B_Front is ready ", this.game_id);
	// 		}
	// 	}
	// 	else
	// 	{
	// 		//report incident ?
	// 		console.log("specytator tried to click player ready", this.game_id);
	// 	}

	// 	if ((this.Player_A_Back_status === PlayerStatus.Ready 
	// 		&& this.Player_B_Back_status === PlayerStatus.Ready
	// 		&& this.game_type === GameType.Singles)
	// 		||
	// 		(this.Player_A_Back_status === PlayerStatus.Ready
	// 		&& this.Player_B_Back_status === PlayerStatus.Ready
	// 		&&this.Player_A_Front_status === PlayerStatus.Ready
	// 		&& this.Player_B_Front_status === PlayerStatus.Ready
	// 		&& this.game_type === GameType.Doubles))
	// 	{
	// 		console.log("all players ready ", this.game_id);
	// 		this.lobby_broadcast_message('lobby_all_ready');
	// 		if (!this.already_started)
	// 		{
	// 			this.game.start();
	// 			this.already_started = true;
	// 		}
	// 	}
	// }

	game_receive_input(client: AuthenticatedSocket, input: PlayerInput)
	{
		if ((client.user.id === this.Player_A_Back.user.id && input.player_type === PlayerType.Player_A_Back)
			||(client.user.id === this.Player_B_Back.user.id && input.player_type === PlayerType.Player_B_Back))
			{
				this.game.core.append_input(input);
			}
			else if(this.game_type === GameType.Doubles
				&& ((client.user.id === this.Player_A_Front.user.id && input.player_type === PlayerType.Player_A_Front)
				||(client.user.id === this.Player_B_Front.user.id && input.player_type === PlayerType.Player_B_Front)))
			{
				this.game.core.append_input(input);
			}
			else
			{
//TODO better logging
				// console.log("input incidend", input);
				// console.log("player_type", input.player_type);
				// console.log("client.user.id", client.user.id);
				// console.log("this.Player_A_Back_id", this.Player_A_Back_id);
				// console.log("this.Player_B_Back_id", this.Player_B_Back_id);
			}
	}


	game_send_round_setup(client: AuthenticatedSocket)
	{
		let ret: RoundSetup;

		ret = this.game.core.get_round_setup();
		client.emit('round_setup', ret);
	}

}