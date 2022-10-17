import { Server } from 'socket.io';
import { generate } from 'shortid'
import { Lobby } from './lobby';
import { Socket } from 'socket.io';
import { PlayersLobbyData,  NewGameData, PlayerInput } from 'src/types/shared.types';

export class LobbyFactory
{
	server: Server;
	private lobby_list: Map<Lobby['game_id'], Lobby> = new Map<Lobby['game_id'], Lobby>();
	private client_list: Map<Socket['id'], Lobby['game_id']> = new Map<Socket['id'], Lobby['game_id']>();

	lobby_create(data: {player_A: string, player_B: string}): NewGameData
	{


		if (data.player_A === 'Mario' && data.player_B === 'Luigi')
		{
			let ret:NewGameData =
			{
				player_A: 'Mario',
				player_A_secret: '9rzx9PAs0r',
				player_B: 'Luigi',
				player_B_secret: 'oVugmgY4Ck',
				game_id: 'aKnHwyr8z'
			}
			const lobby = new Lobby(ret);
			this.lobby_list.set(lobby.game_id, lobby);
	
			return ret;
		}



		const game_id: string = generate();
		const player_A_secret: string = generate();
		const player_B_secret: string = generate();

		let ret:NewGameData =
		{
			player_A : data.player_A,
			player_A_secret : player_A_secret,
			player_B : data.player_B,
			player_B_secret : player_B_secret,
			game_id : game_id
		};

		const lobby = new Lobby(ret);
		this.lobby_list.set(lobby.game_id, lobby);

		return ret;
	}

	lobby_delete(game_id: string)
	{
		let lobby: Lobby | undefined =  this.lobby_list.get(game_id);
		if (lobby !== undefined)
		{
			lobby.lobby_remove_all();
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
		}
		else
		{
			client.emit('join_lobby_fail', 'room not found');
			console.log("unable to join room, not found: ", data.game_id);
		}
		//this.lobby_list.get(data.game_id).lobby_add(client, data.player_secret);
	}

	lobby_quit(client: Socket)
	{
		let game_id: string | undefined = this.locate_client(client);
		if (game_id !== undefined )
		{
			this.lobby_list.get(game_id).lobby_disconnect(client);
			this.client_list.delete(client['id']);
		}
	}

	locate_client(client: Socket): string
	{
		//console.log(map1.get('bar'));
		return this.client_list.get(client['id']);
	}

	lobby_request_status(client: Socket, game_id: string)
	{
		this.lobby_list.get(game_id)?.lobby_send_lobby_status(client);
	}

	lobby_player_ready(client: Socket, game_id: string)
	{
		// let game_id: string | undefined = this.locate_client(client);
		// if (game_id !== undefined )
		// {
			this.lobby_list.get(game_id)?.player_ready(client);
			
		//}
	}

	lobby_game_input(data: any)
	{
//console.log("in factory input ", data);
		this.lobby_list.get(data[0])?.game_receive_input(data[1]);
	}



	lobby_game_get_round_setup(client: Socket, game_id: string)
	{
		this.lobby_list.get(game_id)?.game_send_round_setup(client);
	}

}