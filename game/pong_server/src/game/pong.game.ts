import { EndResult, GameState, Goal, RoundSetup } from "../types/shared.types";
import { Lobby } from "../lobby/lobby";
import PongCore from "./pong.core"

export class PongGame
{

	update_interval;
	send_interval;

	core: PongCore = new PongCore();
	saved_states: Array<GameState> = new Array();
//debug: number = 0;
	constructor(
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

				// let gamestate: GameState = this.core.get_gamestate();
				// this.saved_states.push(gamestate);
				// self.send_state(gamestate);
				self.send_state();
			}; })(this),
		  1000 / 60);

	}

	send_state = () =>
	{
		let gamestate: GameState = this.core.get_gamestate();

// console.log('saving state#', this.debug);
// this.debug++;
// console.log(gamestate);
		
		// this.saved_states.push(gamestate);
		// JSON.parse(JSON.stringify(Obj1))
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


// console.log('### start saved_states for each ######');
// console.log('######## after the game ##############');
// this.saved_states.forEach((gamestate, index) => {
	
// 	console.log('after game frame#', index)
// 	console.log(gamestate);
// 	console.log('ball position:',gamestate.balldata.position);
	
// });
				
				
				//save it
				this.lobby.factory.save_replay(this.lobby.game_id, this.saved_states);

				//destroy le lobby ?
				// setTimeout(function (){

					this.lobby.factory.lobby_delete(this.lobby.game_id);
				// }, 5000);


			}


		}

	}


}