import 'phaser';
import { io } from "socket.io-client";
import ClientSocketManager from '../client.socket.manager';
import PongCore from '../pong.core';
import { GameState, Goal, Movement, PlayerInput, PlayerType, BallData, EndResult, RoundSetup, GameType, GameSettings } from '../types/shared.types';

export default class Pong extends Phaser.Scene
{
	constructor ()
	{
		super({ key: 'Pong' });
	}

	me: PlayerType = PlayerType.Spectator;
	socketmanager?: ClientSocketManager;

	game_settings: GameSettings | undefined = undefined;
	game_type: GameType = GameType.Singles;




	sound_a?: any;
	sound_b?: any;
	sound_c?: any;
	sound_clapping?: any;



	core?: PongCore;
	game_id?: string;

	//Displayed elements
	asset_ball?: Phaser.GameObjects.Image;
	asset_scoreboard?: Phaser.GameObjects.Text;
	upper_limit?: Phaser.GameObjects.Shape;
	lower_limit?: Phaser.GameObjects.Shape;
	asset_lag_icon?: Phaser.GameObjects.Image;

	asset_Player_A_Back?: Phaser.GameObjects.Shape;
	asset_Player_A_Front?: Phaser.GameObjects.Shape;
	asset_Player_B_Front?: Phaser.GameObjects.Shape;
	asset_Player_B_Back?: Phaser.GameObjects.Shape;

	//Input Keys
	key_UP?: any;
	key_DOWN?: any;

	input_UP: boolean = false;
	input_DOWN: boolean = false;
	input_number: number = 1;
	latest_serv_response: number = 0;
	input_stock: Array<PlayerInput> = new Array();
	server_stock: Array<GameState> = new Array();
	past_stock: Array<GameState> = new Array();
	next_round_setup: RoundSetup | undefined = undefined;

	game_state: GameState =
	{
		game_type: GameType.Singles,
		result: EndResult.Undecided,
		goal: Goal.None,
		score:
		{
			Team_A: 0,
			Team_B: 0
		},
		balldata:
		{
			position: { x: 0, y: 0 },
			velocity: 0,
			vector: { x: 0, y: 0  }
		},
		Player_A_Back: { x: 0, y: 300 },
		Player_A_Front: { x: 0, y: 300 },
		Player_B_Front: { x: 0, y: 300 },
		Player_B_Back: { x: 0, y: 300 },
		last_processed_id_A_Back: 0,
		last_processed_id_A_Front: 0,
		last_processed_id_B_Front: 0,
		last_processed_id_B_Back: 0,
		send_date: new Date()
	};


	update_interval: any;
	is_lagging: boolean = true;
	lag_count: number = 0;

	preload ()
	{
		this.load.image('ball', 'assets/black_dot.png');
		this.load.image('lag_icon', 'assets/lag_icon.png');

		// this.load.audio('sound_a', 'assets/sound/8bit_effect_a.ogg');
		// this.load.audio('sound_b', 'assets/sound/8bit_effect_b.ogg');
		// this.load.audio('sound_c', 'assets/sound/8bit_effect_c.ogg');
		// this.load.audio('clapping', 'assets/sound/clapping.ogg');
	}

	create ()
	{
		this.socketmanager = this.registry.get('socketmanager');
		this.next_round_setup = this.registry.get('round_setup');
		this.game_id = this.registry.get('players_data').game_id;

		this.game_settings = this.game.registry.get('players_data').game_settings;
		console.log("setings: ", this.game_settings);
		this.game_type = this.game.registry.get('players_data').game_settings.game_type;

		if (this.game_settings) {
			this.core = new PongCore(this.game_settings);

			this.game_state.game_type = this.game.registry.get('players_data').game_settings.game_type;
			this.game_state.Player_A_Back.x = this.game_settings.player_back_advance;
			this.game_state.Player_A_Front.x = this.game_settings.player_front_advance;
			this.game_state.Player_B_Back.x = 800 - this.game_settings.player_back_advance;
			this.game_state.Player_B_Front.x = 800 - this.game_settings.player_front_advance;
		}

		this.me = this.game.registry.get('players_data').player_type;


		// this.sound_a = this.sound.add('sound_a');
		// this.sound_b = this.sound.add('sound_b');
		// this.sound_c = this.sound.add('sound_c');
		// this.sound_clapping = this.sound.add('clapping');
	


		if (this.socketmanager !== undefined)
		{
			this.socketmanager.set_pong_triggers({
				append_server_gamestate: this.append_server_gamestate.bind(this),
				apply_round_setup: this.apply_round_setup.bind(this),
				game_end: this.game_end.bind(this)
	
			});

		}


		if (this.core !== undefined)
		{
//console.log('setting triggers for core')
			// this.core.set_pong_triggers({

			// 	// play_sound_a: this.play_sound_a.bind(this),
			// 	// play_sound_b: this.play_sound_b.bind(this),
			// 	// play_sound_c: this.play_sound_c.bind(this),
			// 	// play_sound_clapping: this.play_sound_clapping.bind(this)



			// });
		}

		this.asset_ball = this.add.image(400, 300, 'ball');
		this.asset_lag_icon = this.add.image(400, 300, 'lag_icon');
		this.asset_lag_icon.setAlpha(1);
// console.log("paddle h", this.game_settings.paddle_size_h);
		if (this.game_settings) {
			this.upper_limit = this.add.rectangle(0, 0, 800, this.game_settings.up_down_border , 0x000000).setOrigin(0,0);
			this.lower_limit = this.add.rectangle(0, (600 - (this.game_settings.up_down_border)), 800, this.game_settings.up_down_border, 0x000000).setOrigin(0,0);
	
			this.asset_Player_A_Back = this.add.rectangle(this.game_settings.player_back_advance, 300, 10, this.game_settings.paddle_size_h, 0x000000).setOrigin(1,0.5);
			this.asset_Player_B_Back = this.add.rectangle((600 - this.game_settings.player_back_advance), 300, 10, this.game_settings.paddle_size_h, 0x000000).setOrigin(0,0.5);
	
			if (this.game_type === GameType.Doubles)
			{
				this.asset_Player_A_Front = this.add.rectangle(this.game_settings.player_front_advance, 300, 10, this.game_settings.paddle_size_h, 0x000000).setOrigin(1,0.5);
				this.asset_Player_B_Front = this.add.rectangle((600 - this.game_settings.player_front_advance), 300, 10, this.game_settings.paddle_size_h, 0x000000).setOrigin(0,0.5);
			
			}
		}

		let style: Phaser.Types.GameObjects.Text.TextStyle = 
		{
			fontSize: '32px',
			color: '#000000',
			fontFamily: 'Arial'
		}

		let text: string;
		text = this.game_state.score.Team_A.toString() + " - " + this.game_state.score.Team_B.toString();
		this.asset_scoreboard = this.add.text(400, 100, text, style)


		if (this.me !== PlayerType.Spectator)
		{
			this.key_UP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
			this.key_DOWN = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
		}

		this.socketmanager?.game_get_round_setup(this.game_id!);



		clearInterval(this.update_interval);
		this.update_interval = setInterval(
		  (function(self) { return function()
			{
				self.frame_advance();
			}; })(this),
		  1000 / 60);
	}

	frame_advance()
	{
		if (this.next_round_setup === undefined)
		{
			this.socketmanager?.game_get_round_setup(this.game_id!);
			return;
		}

		//Determine player input
		if (this.me !== PlayerType.Spectator)
		{
			
			let current_move: Movement = Movement.Neutral;
	
			if (this.key_UP !== undefined && this.key_DOWN !== undefined)
			{
				
				if (this.key_UP.isDown)
					this.input_UP = true;
				else 
					this.input_UP = false;
		
				if (this.key_DOWN.isDown)
					this.input_DOWN = true;
				else
					this.input_DOWN = false;
			}
	
			if (this.input_UP && this.input_DOWN)
				current_move = Movement.Neutral;
			else if (this.input_UP)
				current_move = Movement.Up;
			else if (this.input_DOWN)
				current_move = Movement.Down;

			let player_input: PlayerInput =
			{
				player_type: this.me,
				number: this.input_number,
				time: new Date(),
				movement: current_move
			};

			this.input_number++;
			this.input_stock.push(player_input);
			this.socketmanager?.game_send_input(this.registry.get('players_data').game_id, player_input);
		}


		//check received data from server
		if (this.server_stock.length !== 0)
		{
			if (this.core) {
				if (this.me !== PlayerType.Spectator)
				this.core.apply_input(this.input_stock[(this.input_stock.length - 1)]);

				this.core.move_ball();
				this.core.client_check_goal();
			}

			this.is_lagging = false;
			this.lag_count = 0;
			this.server_stock.forEach((elem: GameState) =>
			{
				if (this.core)
					this.core.apply_gamestate(elem);
				let last_serv;
	
				if (this.me === PlayerType.Player_A_Back)
				{
					last_serv = elem.last_processed_id_A_Back;
				}
				else if (this.me === PlayerType.Player_B_Back)
				{
					last_serv = elem.last_processed_id_B_Back;
				}
				else if (this.game_type === GameType.Doubles)
				{
					if (this.me === PlayerType.Player_A_Front)
					{
						last_serv = elem.last_processed_id_A_Front;
					}
					else if (this.me === PlayerType.Player_B_Front)
					{
						last_serv = elem.last_processed_id_B_Front;
					}
				}
	
				if(last_serv && last_serv > this.latest_serv_response)
				{
					this.latest_serv_response = last_serv;
				}
			}, this);
			this.server_stock = [];
			if (this.me !== PlayerType.Spectator)
			{
				this.input_stock = this.input_stock.filter((elem: PlayerInput) =>
				{
					return (elem.number > this.latest_serv_response);
				}, this);
		
				this.input_stock.forEach((elem: PlayerInput) =>
				{
					if (this.core)
						this.core.apply_input(elem);
				}, this);
			}

		}
		else
		{
			//no responde from server
			this.lag_count++;
			if (this.lag_count >= 15)
			{
				this.is_lagging = true;
			}
			if (this.core) {
				if (this.me !== PlayerType.Spectator)
				this.core.apply_input(this.input_stock[(this.input_stock.length - 1)]);
				this.core.update_gamestate();
			}
		}

		if (this.core)
			this.game_state = this.core.get_gamestate();
		this.past_stock.push(this.game_state);

		// let past_date: Date = new Date();
		// past_date.setMilliseconds(past_date.getMilliseconds() - 100);

		//Display

		if (this.game_type === GameType.Singles)
		{
			this.display_singles();
		}
		else
		{
			this.display_doubles();
		}

		if (this.asset_scoreboard !== undefined)
		{
			let text: string;
			text = this.game_state.score.Team_A.toString() + " - " + this.game_state.score.Team_B.toString();
			this.asset_scoreboard?.setText(text);
		}

		this.lag_check();
	}


	apply_round_setup = (round_setup: RoundSetup) =>
	{
		this.next_round_setup = round_setup;
	}

	append_server_gamestate = (gamestate: GameState) =>
	{
		this.server_stock.push(gamestate);
	}

	// display_score = () =>
	// {
	// 	let text: string;
	// 	text = this.game_state.score.Team_A.toString() + " - " + this.game_state.score.Team_B.toString();


	// 	this.asset_scoreboard?.setText(text);
	// }

	acknowledge_server_authority = (gamestate: GameState) =>
	{

	}

	lag_check = () =>
	{
		if (this.is_lagging && this.game_state.result === EndResult.Undecided)
			this.asset_lag_icon!.setAlpha(1);
		else
			this.asset_lag_icon!.setAlpha(0);
	}


	game_end = (winner: EndResult) =>
	{
		this.game.registry.set('winner', winner);
//TODO
//clear l'interval ?
		// setTimeout(() => { 
			clearInterval(this.update_interval);
		// }, 100);

		// setTimeout(() => { 
		// 	this.scene.start('MatchResult');
		// //	this.scene.remove('Pong');
		// }, 500);


		this.time.addEvent({
			delay: 500,
			callback: () =>
			{				
				this.launch_match_result();
			},
			callbackScope: this,
			loop: false });
	}

	launch_match_result = () =>
	{
		this.scene.start('MatchResult');
	}

	display_singles = () =>
	{
		let past_date: Date = new Date();
		past_date.setMilliseconds(past_date.getMilliseconds() - 100);
		let used_past: boolean = false;

		if ( this.asset_Player_A_Back !== undefined
			&& this.asset_Player_B_Back !== undefined
			&& this.asset_ball !== undefined )
		{
			if (this.me === PlayerType.Player_A_Back)
			{
				this.asset_Player_A_Back.x = this.game_state.Player_A_Back.x;
				this.asset_Player_A_Back.y = this.game_state.Player_A_Back.y;
			}
			else if (new Date(this.past_stock[0].send_date).getTime() > past_date.getTime())
			{
				this.asset_Player_A_Back.x = this.past_stock[0].Player_A_Back.x;
				this.asset_Player_A_Back.y = this.past_stock[0].Player_A_Back.y;
				used_past = true;
			}
			else
			{
				this.asset_Player_A_Back.x = this.game_state.Player_A_Back.x;
				this.asset_Player_A_Back.y = this.game_state.Player_A_Back.y;
			}


			if (this.me === PlayerType.Player_B_Back)
			{
				this.asset_Player_B_Back.x = this.game_state.Player_B_Back.x;
				this.asset_Player_B_Back.y = this.game_state.Player_B_Back.y;
			}
			else if (new Date(this.past_stock[0].send_date).getTime() > past_date.getTime())
			{
				this.asset_Player_B_Back.x = this.past_stock[0].Player_B_Back.x;
				this.asset_Player_B_Back.y = this.past_stock[0].Player_B_Back.y;
				used_past = true;
			}
			else
			{
				this.asset_Player_B_Back.x = this.game_state.Player_B_Back.x;
				this.asset_Player_B_Back.y = this.game_state.Player_B_Back.y;
			}

			if (this.me === PlayerType.Spectator 
				&& new Date(this.past_stock[0].send_date).getTime() > past_date.getTime())
			{
				this.asset_ball.x = this.past_stock[0].balldata.position.x;
				this.asset_ball.y = this.past_stock[0].balldata.position.y;
				used_past = true;
			}
			else
			{
				this.asset_ball.x = this.game_state.balldata.position.x;
				this.asset_ball.y = this.game_state.balldata.position.y;
			}
		}

		if (used_past)
		{
			this.past_stock.shift();
		}
	}



	display_doubles = () =>
	{
		let past_date: Date = new Date();
		past_date.setMilliseconds(past_date.getMilliseconds() - 100);
		let used_past: boolean = false;
		
		if ( this.asset_Player_A_Back !== undefined
			&& this.asset_Player_B_Back !== undefined
			&& this.asset_Player_A_Front !== undefined
			&& this.asset_Player_B_Front !== undefined
			&& this.asset_ball !== undefined )
		{
		
			if (this.me === PlayerType.Player_A_Back)
			{
				this.asset_Player_A_Back.x = this.game_state.Player_A_Back.x;
				this.asset_Player_A_Back.y = this.game_state.Player_A_Back.y;
			}
			else if (new Date(this.past_stock[0].send_date).getTime() > past_date.getTime())
			{
				this.asset_Player_A_Back.x = this.past_stock[0].Player_A_Back.x;
				this.asset_Player_A_Back.y = this.past_stock[0].Player_A_Back.y;
				used_past = true;
			}
			else
			{
				this.asset_Player_A_Back.x = this.game_state.Player_A_Back.x;
				this.asset_Player_A_Back.y = this.game_state.Player_A_Back.y;
			}


			if (this.me === PlayerType.Player_B_Back)
			{
				this.asset_Player_B_Back.x = this.game_state.Player_B_Back.x;
				this.asset_Player_B_Back.y = this.game_state.Player_B_Back.y;
			}
			else if (new Date(this.past_stock[0].send_date).getTime() > past_date.getTime())
			{
				this.asset_Player_B_Back.x = this.past_stock[0].Player_B_Back.x;
				this.asset_Player_B_Back.y = this.past_stock[0].Player_B_Back.y;
				used_past = true;
			}
			else
			{
				this.asset_Player_B_Back.x = this.game_state.Player_B_Back.x;
				this.asset_Player_B_Back.y = this.game_state.Player_B_Back.y;
			}

			if (this.me === PlayerType.Player_A_Front)
			{
				this.asset_Player_A_Front.x = this.game_state.Player_A_Front.x;
				this.asset_Player_A_Front.y = this.game_state.Player_A_Front.y;
			}
			else if (new Date(this.past_stock[0].send_date).getTime() > past_date.getTime())
			{
				this.asset_Player_A_Front.x = this.past_stock[0].Player_A_Front.x;
				this.asset_Player_A_Front.y = this.past_stock[0].Player_A_Front.y;
				used_past = true;
			}
			else
			{
				this.asset_Player_A_Front.x = this.game_state.Player_A_Front.x;
				this.asset_Player_A_Front.y = this.game_state.Player_A_Front.y;
			}


			if (this.me === PlayerType.Player_B_Front)
			{
				this.asset_Player_B_Front.x = this.game_state.Player_B_Front.x;
				this.asset_Player_B_Front.y = this.game_state.Player_B_Front.y;
			}
			else if (new Date(this.past_stock[0].send_date).getTime() > past_date.getTime())
			{
				this.asset_Player_B_Front.x = this.past_stock[0].Player_B_Front.x;
				this.asset_Player_B_Front.y = this.past_stock[0].Player_B_Front.y;
				used_past = true;
			}
			else
			{
				this.asset_Player_B_Front.x = this.game_state.Player_B_Front.x;
				this.asset_Player_B_Front.y = this.game_state.Player_B_Front.y;
			}

			if (this.me === PlayerType.Spectator 
				&& new Date(this.past_stock[0].send_date).getTime() > past_date.getTime())
			{
				this.asset_ball.x = this.past_stock[0].balldata.position.x;
				this.asset_ball.y = this.past_stock[0].balldata.position.y;
				used_past = true;
			}
			else
			{
				this.asset_ball.x = this.game_state.balldata.position.x;
				this.asset_ball.y = this.game_state.balldata.position.y;
			}		
			
		}

		if (used_past)
		{
			this.past_stock.shift();
		}


	}

	play_sound_a = () =>
	{
		this.sound.stopAll();
		this.sound_a.play();
	}

	play_sound_b = () =>
	{
		this.sound.stopAll();
		this.sound_b.play();
	}

	play_sound_c = () =>
	{
		this.sound.stopAll();
		this.sound_c.play();
	}

	play_sound_clapping = () =>
	{
		this.sound.stopAll();
		this.sound_clapping.play();
	}

}





/*
		if (this.me === PlayerType.Player_A_Back)
		{
			if ( this.asset_player_A !== undefined
				&& this.asset_player_B !== undefined
				&& this.asset_ball !== undefined )
				{
					this.asset_player_A.x = this.game_state.player_A.x;
					this.asset_player_A.y = this.game_state.player_A.y;

					if(new Date(this.past_stock[0].last_processed_time_B).getTime() > past_date.getTime() )
					{
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
		

		}
		else
		{
			if ( this.asset_player_A !== undefined
				&& this.asset_player_B !== undefined
				&& this.asset_ball !== undefined )
				{

					if(new Date(this.past_stock[0].last_processed_time_A).getTime() > past_date.getTime() )
					{
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
		

		}
		*/