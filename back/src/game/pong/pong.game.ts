import { GameState, GameSettings, RoundSetup, Goal, EndResult} from "src/utils/types/game.types";
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
				if (this.game_settings.is_ranked) {

				}
				
				//save replay
				this.lobby.factory.save_replay(this.lobby.game_id, this.saved_states);

//TODO 
//send to db game result and replay
//ensure stuff is finished saving before nuking lobby

				//destroy le lobby ?
				// setTimeout(function (){

					this.lobby.factory.lobby_delete(this.lobby.game_id);
				// }, 5000);


			}


		}

	}


}