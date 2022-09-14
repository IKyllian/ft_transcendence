import { Socket } from "socket.io";
import { PongGame } from "../game/pong.game";
import { NewGameData, PlayerStatus } from "../types/shared.types";

export class Lobby
{
	public game_id: string;
	public creation_date: Date = new Date();
	public spectators: Map<Socket['id'], Socket> = new Map<Socket['id'], Socket>();
	public player_A?: Socket;
	player_A_status: PlayerStatus = PlayerStatus.Absent;
	public player_B?: Socket;
	player_B_status: PlayerStatus = PlayerStatus.Absent;
	public instance: PongGame = new PongGame(this);

	constructor(
		public gamedata: NewGameData
		)
	{
		this.game_id = gamedata.game_id;
	}


	// on_disconnect(client: Socket)
	// {
	// 	//if player -> abort
	// 	//if spectator remove
	// }

	lobby_add(client: Socket, player_secret: string)
	{
console.log("in lobby add ", player_secret);
		if (player_secret === this.gamedata.player_A_secret)
		{
			this.player_A = client;
			this.player_A_status = PlayerStatus.Present;
		}
		else if (player_secret === this.gamedata.player_B_secret)
		{
			this.player_B = client;
			this.player_B_status = PlayerStatus.Present;
		}
		else 
		{
			this.spectators.set(client['id'], client);
		}
	}

	lobby_disconnect(client: Socket)
	{
		if (client['id'] === this.player_A['id'])
		{
			//playerA left
			console.log("player A left from game ", this.game_id);
			this.player_A_status = PlayerStatus.Absent;
			//if game_has_started
			//abort game
		}
		else if (client['id'] === this.player_B['id'])
		{
			//playerB left
			console.log("player B left from game ", this.game_id);
			this.player_A_status = PlayerStatus.Absent;
			//if game_has_started
			//abort game
		}
		else
		{
			this.spectators.delete(client['id']);
		}
	}

	lobby_remove_all()
	{
		this.player_A.disconnect();
		this.player_B.disconnect();
		this.spectators.forEach(function(spectator)
		{
			spectator.disconnect();
		});
	}

	player_ready(client: Socket)
	{
		if (client['id'] === this.player_A['id'])
		{
			this.player_A_status = PlayerStatus.Ready;
			console.log("player A is ready ", this.game_id);
		}
		else if (client['id'] === this.player_B['id'])
		{
			this.player_B_status = PlayerStatus.Ready;
			console.log("player B is ready ", this.game_id);
		}
		else
		{
			//report incident ?
			console.log("problem in player_ready() ", this.game_id);
		}

		if (this.player_A_status === PlayerStatus.Ready 
			&& this.player_B_status === PlayerStatus.Ready)
		{
			//both players ready
			console.log("both players ready ", this.game_id);
		}
	}
}