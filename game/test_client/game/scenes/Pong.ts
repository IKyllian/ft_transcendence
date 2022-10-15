import 'phaser';
import { io } from "socket.io-client";
import ClientSocketManager from '../client.socket.manager';
import PongCore from '../pong.core';
import { GameState, Goal, Movement, Player, PlayerInput, PlayerType, BallData, EndResult, RoundSetup } from '../types/shared.types';

export default class Pong extends Phaser.Scene
{
	constructor ()
	{
		super({ key: 'Pong' });
	}

	me: PlayerType = PlayerType.Spectator;
	socketmanager?: ClientSocketManager;
	core: PongCore = new PongCore();
	game_id?: string;

	//Displayed elements
	asset_ball?: Phaser.GameObjects.Image;
	// asset_player_A?: Phaser.GameObjects.Image;
	// asset_player_B?: Phaser.GameObjects.Image;
	asset_player_A?: Phaser.GameObjects.Shape;
	asset_player_B?: Phaser.GameObjects.Shape;
	asset_scoreboard?: Phaser.GameObjects.Text;
	upper_limit?: Phaser.GameObjects.Shape;
	lower_limit?: Phaser.GameObjects.Shape;
	asset_lag_icon?: Phaser.GameObjects.Image;

	//Input Keys
	key_UP?;
	key_DOWN?;

	input_UP: boolean = false;
	input_DOWN: boolean = false;
	// last_move: Movement = Movement.Neutral;
	input_number: number = 1;
	latest_serv_response: number = 0;
	input_stock: Array<PlayerInput> = new Array();
	server_stock: Array<GameState> = new Array();
	past_stock: Array<GameState> = new Array();
	next_round_setup: RoundSetup | undefined = undefined;

	game_state: GameState =
	{
		result: EndResult.Undecided,
		goal: Goal.None,
		score:
		{
			player_A: 0,
			player_B: 0
		},
		balldata:
		{
			position: { x: 0, y: 0 },
			velocity: 0,
			vector: { x: 0, y: 0  }
		},
		player_A: { x: 0, y: 0 },
		last_processed_id_A: 0,
		last_processed_time_A: new Date(),
		player_B:  { x: 0, y: 0 },
		last_processed_id_B: 0,
		last_processed_time_B: new Date()	
	};


	update_interval;
	is_lagging: boolean = true;
	lag_count: number = 0;

	preload ()
	{
		this.load.image('ball', 'assets/black_dot.png');
		this.load.image('player_A', 'assets/red_bar.png');
		this.load.image('player_B', 'assets/blue_bar.png');
		this.load.image('lag_icon', 'assets/lag_icon.png');
	}

	create ()
	{
		this.socketmanager = this.registry.get('socketmanager');
		this.next_round_setup = this.registry.get('round_setup');
		this.game_id = this.registry.get('players_data').game_id;

		if (this.socketmanager !== undefined)
		{
			this.socketmanager.set_pong_triggers({

//				acknowledge_server_authority: this.acknowledge_server_authority.bind(this),
				append_server_gamestate: this.append_server_gamestate.bind(this),
				apply_round_setup: this.apply_round_setup.bind(this)
	
			});

		}

		this.asset_ball = this.add.image(400, 300, 'ball');
		// this.asset_player_A = this.add.image(100, 300, 'player_A');
		// this.asset_player_B = this.add.image(700, 300, 'player_B');
		this.asset_player_A = this.add.rectangle(20, 300, 10, 150, 0x000000);
		this.asset_player_B = this.add.rectangle(580, 300, 10, 150, 0x000000);
		this.asset_lag_icon = this.add.image(400, 300, 'lag_icon');
		this.asset_lag_icon.setAlpha(1);

//		new Rectangle(scene, x, y [, width] [, height] [, fillColor] [, fillAlpha])
		this.upper_limit = this.add.rectangle(400, 10, 800, 20, 0x000000);
		this.lower_limit = this.add.rectangle(400, 590, 800, 20, 0x000000);

		let style: Phaser.Types.GameObjects.Text.TextStyle = 
		{
			fontSize: '32px',
			color: '#000000',
			fontFamily: 'Arial'
		}

		let text: string;
		text = this.game_state.score.player_A.toString() + " - " + this.game_state.score.player_B.toString();
		this.asset_scoreboard = this.add.text(400, 100, text, style)
	//	this.asset_scoreboard?.setText(text);

		this.me = this.game.registry.get('players_data').playertype;


		this.key_UP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
		this.key_DOWN = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);


		this.socketmanager?.game_get_round_setup(this.game_id!);


//test
		clearInterval(this.update_interval);
		this.update_interval = setInterval(
		  (function(self) { return function()
			{
				self.test();
				//self.send_state();
			}; })(this),
		  1000 / 60);


	}


	// update(time: number, delta: number): void
	test()
	{
		//let now :Date = new Date();
		if (this.next_round_setup === undefined)
			return;
		// if (new Date(this.next_round_setup.start_time).getTime() > now.getTime())
		// 	return;


		if (this.me !== PlayerType.Spectator)
		{
			
					let current_move: Movement = Movement.Neutral;
			
					if (this.key_UP !== undefined && this.key_DOWN !== undefined)
					{
						
						if (this.key_UP.isDown)
						{
							this.input_UP = true;
						}
						else 
						{
							this.input_UP = false;
						}
				
						if (this.key_DOWN.isDown)
						{
							this.input_DOWN = true;
						}
						else
						{
							this.input_DOWN = false;
						}
					}
			
					if (this.input_UP && this.input_DOWN)
					{
						current_move = Movement.Neutral;
					}
					else if (this.input_UP)
					{
						current_move = Movement.Up;
					}
					else if (this.input_DOWN)
					{
						current_move = Movement.Down;
					}
			
			
					let player_input: PlayerInput =
					{
						playertype: this.me,
						number: this.input_number,
						time: new Date(),
						movement: current_move
					};
					this.input_number++;
					this.input_stock.push(player_input);
					this.socketmanager?.game_send_input(this.registry.get('players_data').game_id, player_input);



		}



		if (this.server_stock.length !== 0)
		{
			this.is_lagging = false;
			this.lag_count = 0;
			this.server_stock.forEach(function(elem: GameState)
			{
				this.core.apply_gamestate(elem);
				let last_serv;
	
				if (this.me === PlayerType.Player_A)
				{
					last_serv = elem.last_processed_id_A;
				}
				else
				{
					last_serv = elem.last_processed_id_B;
				}

	
				if(last_serv > this.latest_serv_response)
				{
					this.latest_serv_response = last_serv;
				}
			}, this);
			this.server_stock = [];
	
			this.input_stock = this.input_stock.filter(function(elem: PlayerInput)
			{
				return (elem.number > this.latest_serv_response);
			}, this);
	
			this.input_stock.forEach(function(elem: PlayerInput)
			{
				this.core.apply_input(elem);
			}, this);

		}
		else
		{
			//no responde from server
			this.lag_count++;
			if (this.lag_count >= 5)
			{
				this.is_lagging = true;
			}

			if (this.me !== PlayerType.Spectator)
				this.core.apply_input(this.input_stock[0]);
			this.core.update_gamestate();
		}






		//get state and display
		this.game_state = this.core.get_gamestate();
		this.past_stock.push(this.game_state);


		let past_date: Date = new Date();
		past_date.setMilliseconds(past_date.getMilliseconds() - 100);

		if (this.me === PlayerType.Player_A)
		{
			if ( this.asset_player_A !== undefined
				&& this.asset_player_B !== undefined
				&& this.asset_ball !== undefined )
				{
					this.asset_player_A.x = this.game_state.player_A.x;
					this.asset_player_A.y = this.game_state.player_A.y;

					if(new Date(this.past_stock[0].last_processed_time_B).getTime() > past_date.getTime() )
					{
	//console.log("dans le if de delay");
						this.asset_player_B.x = this.past_stock[0].player_B.x;
						this.asset_player_B.y = this.past_stock[0].player_B.y;
						this.past_stock.shift();
					}
					else
					{
						this.asset_player_B.x = this.game_state.player_B.x;
						this.asset_player_B.y = this.game_state.player_B.y;
					}
					this.asset_ball.x = this.game_state.balldata.position.x;
					this.asset_ball.y = this.game_state.balldata.position.y;			
				}
		
				if (this.asset_scoreboard !== undefined)
				{
					let text: string;
					text = this.game_state.score.player_A.toString() + " - " + this.game_state.score.player_B.toString();
			
			
					this.asset_scoreboard?.setText(text);
				}
		}
		else if (this.me === PlayerType.Player_B)
		{
			if ( this.asset_player_A !== undefined
				&& this.asset_player_B !== undefined
				&& this.asset_ball !== undefined )
				{
					this.asset_player_B.x = this.game_state.player_B.x;
					this.asset_player_B.y = this.game_state.player_B.y;

					if(new Date(this.past_stock[0].last_processed_time_A).getTime() > past_date.getTime() )
					{
	//console.log("dans le if de delay");
						this.asset_player_A.x = this.past_stock[0].player_A.x;
						this.asset_player_A.y = this.past_stock[0].player_A.y;
						this.past_stock.shift();
					}
					else
					{
						this.asset_player_A.x = this.game_state.player_A.x;
						this.asset_player_A.y = this.game_state.player_A.y;
					}
					this.asset_ball.x = this.game_state.balldata.position.x;
					this.asset_ball.y = this.game_state.balldata.position.y;			
				}
		
				if (this.asset_scoreboard !== undefined)
				{
					let text: string;
					text = this.game_state.score.player_A.toString() + " - " + this.game_state.score.player_B.toString();
			
			
					this.asset_scoreboard?.setText(text);
				}
		}
		else
		{
console.log("dans le if spectateur");
			if ( this.asset_player_A !== undefined
				&& this.asset_player_B !== undefined
				&& this.asset_ball !== undefined )
				{

					if(new Date(this.past_stock[0].last_processed_time_A).getTime() > past_date.getTime() )
					{
console.log("dans le if de delay");
						this.asset_player_A.x = this.past_stock[0].player_A.x;
						this.asset_player_A.y = this.past_stock[0].player_A.y;
						this.asset_player_B.x = this.past_stock[0].player_B.x;
						this.asset_player_B.y = this.past_stock[0].player_B.y;
						this.asset_ball.x = this.past_stock[0].balldata.position.x;
						this.asset_ball.y = this.past_stock[0].balldata.position.y;
						this.past_stock.shift();
					}
					else
					{
						this.asset_player_A.x = this.game_state.player_A.x;
						this.asset_player_A.y = this.game_state.player_A.y;
						this.asset_player_B.x = this.game_state.player_B.x;
						this.asset_player_B.y = this.game_state.player_B.y;
						this.asset_ball.x = this.game_state.balldata.position.x;
						this.asset_ball.y = this.game_state.balldata.position.y;			
					}
				}
		
				if (this.asset_scoreboard !== undefined)
				{
					let text: string;
					text = this.game_state.score.player_A.toString() + " - " + this.game_state.score.player_B.toString();
			
			
					this.asset_scoreboard?.setText(text);
				}
		}





		// if ( this.asset_player_A !== undefined
		// && this.asset_player_B !== undefined
		// && this.asset_ball !== undefined )
		// {
		// //	console.log("in the crappy if");
		// 	this.asset_player_A.x = this.game_state.player_A.x;
		// 	this.asset_player_A.y = this.game_state.player_A.y;
		// 	this.asset_player_B.x = this.game_state.player_B.x;
		// 	this.asset_player_B.y = this.game_state.player_B.y;
		// 	this.asset_ball.x = this.game_state.balldata.position.x;
		// 	this.asset_ball.y = this.game_state.balldata.position.y;			
		// }

		// if (this.asset_scoreboard !== undefined)
		// {
		// 	let text: string;
		// 	text = this.game_state.score.player_A.toString() + " - " + this.game_state.score.player_B.toString();
	
	
		// 	this.asset_scoreboard?.setText(text);
		// }
		this.lag_check();
	}


	apply_round_setup = (round_setup: RoundSetup) =>
	{
		this.next_round_setup = round_setup;
	}

	append_server_gamestate = (gamestate: GameState) =>
	{
		this.server_stock.push(gamestate);
//console.log("server stock size", this.server_stock.length);
	}


	display_score = () =>
	{
		let text: string;
		text = this.game_state.score.player_A.toString() + " - " + this.game_state.score.player_B.toString();


		this.asset_scoreboard?.setText(text);
	}

	acknowledge_server_authority = (gamestate: GameState) =>
	{

	}

	lag_check = () =>
	{
		if (this.is_lagging)
			this.asset_lag_icon!.setAlpha(1);
		else
			this.asset_lag_icon!.setAlpha(0);
	}

}