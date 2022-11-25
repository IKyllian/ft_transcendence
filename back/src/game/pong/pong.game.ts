import { Injectable } from "@nestjs/common";
import { GameState, GameSettings, RoundSetup, Goal, EndResult, TeamSide, GameType} from "src/utils/types/game.types";
import { GameService } from "../game.service";
import { Lobby } from "../lobby/lobby";
import PongCore from "./pong.core"

export class PongGame
{

	update_interval;
	send_interval;

	core: PongCore = new PongCore(this.game_settings);
	saved_states: Array<GameState> = new Array();
//debug: number = 0;
	constructor(
		public game_settings: GameSettings,
		//public game_mode: GameMode,
		private readonly lobby: Lobby
	)
	{

	}

	start = () =>
	{

		let setup: RoundSetup = this.core.do_round_setup();
		this.lobby.lobby_broadcast_data('round_setup', setup);



		clearInterval(this.update_interval);
		this.update_interval = setInterval(
		  (function(self) { return function()
			{
				self.core.update_gamestate();
				self.send_state();
			}; })(this),
		  1000 / 60);

	}

	send_state = () =>
	{
		let gamestate: GameState = this.core.get_gamestate();

		this.saved_states.push(JSON.parse(JSON.stringify(gamestate)));

		this.lobby.lobby_broadcast_data('game_state', gamestate);

		if (gamestate.goal !== Goal.None)
		{
			if (gamestate.result === EndResult.Undecided)
			{
				let setup: RoundSetup = this.core.get_round_setup();
				this.lobby.lobby_broadcast_data('round_setup', setup);
			}
			else
			{
				//game ended
				console.log('game has ended', this.lobby.game_id);
				this.lobby.lobby_broadcast_data('match_winner', gamestate.result);
				this.lobby.game_set_finished();
				clearInterval(this.update_interval);
				this.lobby.playerSockets.forEach((socket) => {
					console.log("disconnecting: " + socket.id)
					socket.disconnect()
				});
				console.log("result", gamestate.result)

			//	this.lobby.factory.save_replay(this.lobby.game_id, this.saved_states);
				if (this.game_settings.is_ranked) {
					this.lobby.factory.endGameAttribution(
						this.lobby.lobby_data.players,
						gamestate.result,
						this.lobby.game_type,
						this.lobby.game_id,
						gamestate.score,
						this.saved_states
					);
				}
				else
				{
					//TODO set a specific proc for replay saved
					setTimeout( () => {
					this.lobby.factory.lobby_delete(this.lobby.game_id);
					}, 2000);
				}


			}


		}

	}


}