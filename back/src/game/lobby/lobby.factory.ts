import { Server } from 'socket.io';
import { generate } from 'shortid'
import { Lobby } from './lobby';
import { Socket } from 'socket.io';
import { GameState, LobbyRequest, NewGameData, GameType, PlayersLobbyData } from 'src/utils/types/game.types';


//TODO
//rework client handling

export class LobbyFactory
{
	server: Server;
	private lobby_list: Map<Lobby['game_id'], Lobby> = new Map<Lobby['game_id'], Lobby>();
	private client_list: Map<Socket['id'], Lobby['game_id']> = new Map<Socket['id'], Lobby['game_id']>();
	replay_list: Map<string, Array<GameState>> = new Map <string, Array<GameState>>();

	lobby_create(lobby_request: LobbyRequest): NewGameData
	{


		if (lobby_request.Player_A_Back === 'Mario' && lobby_request.Player_B_Back === 'Trent'
		&& lobby_request.Player_A_Front === 'Luigi' && lobby_request.Player_B_Front === 'Daria')
		{
			let ret:NewGameData =
			{
				Player_A_Back: 'Mario',
				Player_A_Back_secret: 'itsmemario',
				Player_A_Front: 'Luigi',
				Player_A_Front_secret: 'ogdgdggY4Ck',
				
				Player_B_Front: 'Daria',
				Player_B_Front_secret: 'lalala-la-la',
				Player_B_Back: 'Trent',
				Player_B_Back_secret: 'spiralmystic',

				game_id: '4p_lobbyggfdgdadf',
				game_settings: lobby_request.game_settings
			}
			const lobby = new Lobby(ret, lobby_request.game_settings, this);
			this.lobby_list.set(lobby.game_id, lobby);
	
			return ret;
		}
		else if (lobby_request.Player_A_Back === 'Mario' && lobby_request.Player_B_Back === 'Luigi')
		{
			let ret:NewGameData =
			{
				Player_A_Back: 'Mario',
				Player_A_Back_secret: '9rzx9PAs0r',
				Player_B_Back: 'Luigi',
				Player_B_Back_secret: 'oVugmgY4Ck',
				
				Player_A_Front: '',
				Player_A_Front_secret: '',
				Player_B_Front: '',
				Player_B_Front_secret: '',
				
				game_id: 'aKnHwyr8z',
				game_settings: lobby_request.game_settings
			}
			const lobby = new Lobby(ret, lobby_request.game_settings, this);
			this.lobby_list.set(lobby.game_id, lobby);
	
			return ret;
		}



		const game_id: string = generate();
		let ret:NewGameData;
		const player_A_Back_secret: string = generate();
		const player_B_Back_secret: string = generate();

		if (lobby_request.game_settings.game_type === GameType.Doubles)
		{
			const player_A_Front_secret: string = generate();
			const player_B_Front_secret: string = generate();
			ret =
			{
				Player_A_Back : lobby_request.Player_A_Back,
				Player_A_Back_secret : player_A_Back_secret,
				Player_B_Back : lobby_request.Player_B_Back,
				Player_B_Back_secret : player_B_Back_secret,
				Player_A_Front: lobby_request.Player_A_Front,
				Player_A_Front_secret: player_A_Front_secret,
				Player_B_Front: lobby_request.Player_B_Front,
				Player_B_Front_secret: player_B_Front_secret,

				game_id : game_id,
				game_settings: lobby_request.game_settings
			};
		}
		else
		{
			
			ret =
			{
				Player_A_Back : lobby_request.Player_A_Back,
				Player_A_Back_secret : player_A_Back_secret,
				Player_B_Back : lobby_request.Player_B_Back,
				Player_B_Back_secret : player_B_Back_secret,
				Player_A_Front: '',
				Player_A_Front_secret: '',
				Player_B_Front: '',
				Player_B_Front_secret: '',
				game_id : game_id,
				game_settings: lobby_request.game_settings
			};

		}

		const lobby = new Lobby(ret, lobby_request.game_settings,  this);
		this.lobby_list.set(lobby.game_id, lobby);

		return ret;
	}

	lobby_delete(game_id: string)
	{
		let lobby: Lobby | undefined =  this.lobby_list.get(game_id);
		if (lobby !== undefined)
		{
		//	lobby.lobby_remove_all();
			this.lobby_list.delete(game_id);
			console.log("deleted lobby: ", game_id);
		}
		else
		{
			console.log("unable to delete room, not found: ", game_id);
		}		
	}

	get_lobby_quantity(): number
	{
		return this.lobby_list.size;
	}

	get_lobby_list()
	{
//TODO
		let qt = this.get_lobby_quantity();
		//need une maniere plus claire de presenter les data
		//const serializedMap = [...this.lobby_list.entries()];
	}

	lobby_join(client: Socket, data: PlayersLobbyData)
	{

		let lobby: Lobby | undefined =  this.lobby_list.get(data.game_id);
		if (lobby !== undefined)
		{

			lobby.lobby_add(client, data.player_secret);
			this.client_list.set(client['id'], data.game_id);
			client.emit('lobby_join_response', true);
		}
		else
		{
			client.emit('lobby_join_response', false);
			console.log("unable to join room, not found: ", data.game_id);
		}
	}

	lobby_quit(client: Socket)
	{
		let game_id: string | undefined = this.locate_client(client);
		if (game_id !== undefined )
		{
			this.lobby_list.get(game_id)?.lobby_disconnect(client);
			this.client_list.delete(client['id']);
		}
	}

	locate_client(client: Socket): string
	{
		return this.client_list.get(client['id']);
	}

	lobby_request_status(client: Socket, game_id: string)
	{
		this.lobby_list.get(game_id)?.lobby_send_lobby_status(client);
	}

	lobby_player_ready(client: Socket, game_id: string)
	{
		this.lobby_list.get(game_id)?.player_ready(client);
	}

	lobby_game_input(client: Socket, data: any)
	{
		this.lobby_list.get(data[0])?.game_receive_input(client, data[1]);
	}

	lobby_game_get_round_setup(client: Socket, game_id: string)
	{
		this.lobby_list.get(game_id)?.game_send_round_setup(client);
	}


	save_replay(game_id: string, save: Array<GameState>)
	{
		this.replay_list.set(game_id, save);
	}


	send_replay(client: Socket, game_id: string)
	{
		let replay :Array<GameState> | undefined = this.replay_list.get(game_id);
	
		if (replay !== undefined)
		{
			console.log('starting replay send', game_id, 'frame count', replay.length);
		
			replay.forEach((gamestate, index) => {
				setTimeout(() => {

					//TODO investigate date stuff
					//gamestate.last_processed_time_A = new Date();;
					client.emit('replay_state', gamestate);
			
				}, index * (1000 / 60));
			  });
		}
		else
		{
			//emit au client not found
			console.log('replay not found:', game_id);
		}
	}

	replay_debug(game_id: string)
	{
		console.log('@@@@@@@@@@@@@@@ replay data in factory @@@@@@@@@@@@@@@@@');


		let replay :Array<GameState> | undefined = this.replay_list.get(game_id);
		if (replay !== undefined)
		{

			console.log('replay debug', game_id);


			replay.forEach((gamestate, index) => {

				// if (!(index % 10))
				// {
					console.log('factory frame#', index)
					console.log(gamestate);
					console.log('ball position:',gamestate.balldata.position);
				// }

				// if(index === (replay.length -1))
				// {
				// 	console.log('@@@@last one');
				// 	console.log(gamestate);
				// 	
				//}
			});

		}
	}
}