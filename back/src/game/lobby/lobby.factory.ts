import { Server } from 'socket.io';
import { generate } from 'shortid'
import { Lobby } from './lobby';
import { Socket } from 'socket.io';
import { GameState, GameType, GameSettings, NewGameData, PlayersGameData, PlayerType, TeamSide, PlayerPosition, EndResult, ScoreBoard } from 'src/utils/types/game.types';
import { AuthenticatedSocket } from 'src/utils/types/auth-socket';
import { MatchmakingLobby } from '../matchmaking/matchmakingLobby';
import { GlobalService } from 'src/utils/global/global.service';
import { Injectable } from '@nestjs/common';
import { Player } from '../player';
import { GameService } from '../game.service';
import { User } from 'src/typeorm';
//import  * as Defaultgame_settings from '../game-settings';


//TODO
//rework client handling
@Injectable()
export class LobbyFactory
{
	// server: Server;
	constructor(
		private globalService: GlobalService,
		private gameService: GameService,
	) {}

	private lobby_list: Map<Lobby['game_id'], Lobby> = new Map<Lobby['game_id'], Lobby>();
	private client_list: Map<Socket['id'], Lobby['game_id']> = new Map<Socket['id'], Lobby['game_id']>();
	replay_list: Map<string, Array<GameState>> = new Map <string, Array<GameState>>();


	lobby_create(lobby_request: MatchmakingLobby): string
	{
		const game_id: string = generate();

		// const lobby = new Lobby(ret, lobby_request.game_settings,  this);
		const lobby = new Lobby(lobby_request, game_id,  this);
		this.lobby_list.set(lobby.game_id, lobby);

		let dataToFront: PlayersGameData = {
			game_id: game_id,
			player_type: PlayerType.Spectator,
			game_settings: lobby_request.game_settings,
		}

		lobby_request.players.forEach((player) => {
			if (player.team === TeamSide.BLUE) {
				if (player.pos === PlayerPosition.BACK) {
					dataToFront.TeamBlue_Back = player;
				} else {
					dataToFront.TeamBlue_Front = player;
				}
			} else {
				if (player.pos === PlayerPosition.BACK) {
					dataToFront.TeamRed_Back = player;
				} else {
					dataToFront.TeamRed_Front = player;
				}
			}
		});

		lobby_request.players.forEach((player) => {
			if (player.team === TeamSide.BLUE) {
				if (player.pos === PlayerPosition.BACK) {
					dataToFront.player_type = PlayerType.TeamBlue_Back;
				} else {
					dataToFront.player_type = PlayerType.TeamBlue_Front;
				}
			} else {
				if (player.pos === PlayerPosition.BACK) {
					dataToFront.player_type = PlayerType.TeamRed_Back;
				} else {
					dataToFront.player_type = PlayerType.TeamRed_Front;
				}
			}
			this.globalService.server.to('user-' + player.user.id).emit("newgame_data", dataToFront);
		});
		console.log(dataToFront.game_settings)

		// if (lobby_request.game_settings.game_type === GameType.Doubles)
		// {
		// 	player_data.Player_A_Front = lobby_request.Player_A_Front;
		// 	player_data.Player_B_Front = lobby_request.Player_B_Front;
		// }

		// player_data.player_type = PlayerType.Player_A_Back;
		// this.globalService.server.to('user-' + lobby_request.Player_A_Back.user.id).emit("newgame_data", player_data);
		// player_data.player_type = PlayerType.Player_B_Back;
		// this.globalService.server.to('user-' + lobby_request.Player_B_Back.user.id).emit("newgame_data", player_data);

		// if (lobby_request.game_settings.game_type === GameType.Doubles)
		// {
		// 	player_data.player_type = PlayerType.Player_A_Front;
		// 	this.globalService.server.to('user-' + lobby_request.Player_A_Front.user.id).emit("newgame_data", player_data);
	
		// 	player_data.player_type = PlayerType.Player_B_Front;
		// 	this.globalService.server.to('user-' + lobby_request.Player_B_Front.user.id).emit("newgame_data", player_data);
		// }

//ajouter une ref au lobby dans le return ? 
//pour acces a this.already_started & this.already_finished
		return game_id;
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

	lobby_join(client: AuthenticatedSocket, game_id: string)
	{

		let lobby: Lobby | undefined =  this.lobby_list.get(game_id);
		if (lobby !== undefined)
		{

			lobby.lobby_add(client);
			this.client_list.set(client['id'], game_id);
			client.emit('lobby_join_response', true);
		}
		else
		{
			client.emit('lobby_join_response', false);
			console.log("unable to join room, not found: ", game_id);
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

	lobby_request_status(client: AuthenticatedSocket, game_id: string)
	{
		this.lobby_list.get(game_id)?.lobby_send_lobby_status(client);
	}

	// lobby_player_ready(client: Socket, game_id: string)
	// {
	// 	this.lobby_list.get(game_id)?.player_ready(client);
	// }

	lobby_game_input(client: AuthenticatedSocket, data: any)
	{
		this.lobby_list.get(data[0])?.game_receive_input(client, data[1]);
	}

	lobby_game_get_round_setup(client: AuthenticatedSocket, game_id: string)
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

	async endGameAttribution(players: Player[], result: EndResult, game_type: GameType, game_id: string, score: ScoreBoard) {
		let blueTeam: User[] = [];
		let redTeam: User[] = [];
		players.forEach((player) => {
			if (player.team === TeamSide.BLUE) {
				blueTeam.push(player.user);
			} else {
				redTeam.push(player.user);
			}
		})
		this.gameService.eloAttribution(players, result, game_type);
		await this.gameService.saveMatch(blueTeam, redTeam, game_type, score);
		this.lobby_delete(game_id);
	}
}