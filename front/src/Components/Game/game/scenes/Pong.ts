import 'phaser';
import ClientSocketManager from '../client.socket.manager';
import PongCore from '../pong.core';
import { GameState, Goal, Movement, PlayerInput, PlayerType, EndResult, RoundSetup, GameType, GameSettings } from '../types/shared.types';

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

	// sound_a?: any;
	// sound_b?: any;
	// sound_clapping?: any;

	core?: PongCore;
	game_id?: string;

	//Displayed elements
	//Images
	//asset_lag_icon?: Phaser.GameObjects.Image;
	//Texts
	asset_scoreboard?: Phaser.GameObjects.Text;
	//Shapes
	upper_limit?: Phaser.GameObjects.Shape;
	lower_limit?: Phaser.GameObjects.Shape;
	asset_ball?: Phaser.GameObjects.Shape;
	asset_TeamBlue_Back?: Phaser.GameObjects.Shape;
	asset_TeamBlue_Front?: Phaser.GameObjects.Shape;
	asset_TeamRed_Front?: Phaser.GameObjects.Shape;
	asset_TeamRed_Back?: Phaser.GameObjects.Shape;

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
			TeamBlue: 0,
			TeamRed: 0
		},
		balldata:
		{
			position: { x: 0, y: 0 },
			velocity: 0,
			vector: { x: 0, y: 0  }
		},
		TeamBlue_Back: { x: 0, y: 300 },
		TeamBlue_Front: { x: 0, y: 300 },
		TeamRed_Front: { x: 0, y: 300 },
		TeamRed_Back: { x: 0, y: 300 },
		last_processed_id_A_Back: 0,
		last_processed_id_A_Front: 0,
		last_processed_id_B_Front: 0,
		last_processed_id_B_Back: 0,
		send_date: new Date()
	};


	update_interval: any;
	is_lagging: boolean = true;
	lag_count: number = 0;

//test
	frame_count: number = 0;

	preload ()
	{
	//	this.load.image('lag_icon', 'assets/lag_icon.png');

		// this.load.audio('sound_a', 'assets/sound/8bit_effect_a.ogg');
		// this.load.audio('sound_b', 'assets/sound/8bit_effect_b.ogg');
		// this.load.audio('clapping', 'assets/sound/clapping.ogg');
	}

	create ()
	{
		this.socketmanager = this.registry.get('socketmanager');
		this.next_round_setup = this.registry.get('round_setup');
		this.game_id = this.registry.get('players_data').game_id;
		this.game_settings = this.game.registry.get('players_data').game_settings;
		this.game_type = this.game.registry.get('players_data').game_settings.game_type;
		this.me = this.game.registry.get('players_data').player_type;
	

		// this.sound_a = this.sound.add('sound_a');
		// this.sound_b = this.sound.add('sound_b');
		// this.sound_clapping = this.sound.add('clapping');
	
		if (this.socketmanager !== undefined)
		{
			this.socketmanager.set_pong_triggers({
				append_server_gamestate: this.append_server_gamestate.bind(this),
				apply_round_setup: this.apply_round_setup.bind(this),
				game_end: this.game_end.bind(this)
	
			});

		}

		//placing visual elements outside of board for their first instanciation to prevent ghosted visuals
		// this.asset_lag_icon = this.add.image(10400, 300, 'lag_icon');
		// this.asset_lag_icon.setAlpha(1);

		if (this.game_settings)
		{
			this.core = new PongCore(this.game_settings);

			this.game_state.game_type = this.game.registry.get('players_data').game_settings.game_type;
			this.game_state.TeamBlue_Back.x = this.game_settings.player_back_advance;
			this.game_state.TeamBlue_Front.x = this.game_settings.player_front_advance;
			this.game_state.TeamRed_Back.x = 800 - this.game_settings.player_back_advance;
			this.game_state.TeamRed_Front.x = 800 - this.game_settings.player_front_advance;
			this.asset_ball = this.add.circle(10400, 300, 5, 0x000000);
			this.upper_limit = this.add.rectangle(10000, 0, 800, this.game_settings.up_down_border , 0x000000).setOrigin(0,0);
			this.lower_limit = this.add.rectangle(10000, (600 - (this.game_settings.up_down_border)), 800, this.game_settings.up_down_border, 0x000000).setOrigin(0,0);
	
			this.asset_TeamBlue_Back = this.add.rectangle(10000, 300, 10, this.game_settings.paddle_size_h, 0x000000).setOrigin(1,0.5);
			this.asset_TeamRed_Back = this.add.rectangle((10000), 300, 10, this.game_settings.paddle_size_h, 0x000000).setOrigin(0,0.5);
	
			if (this.game_type === GameType.Doubles)
			{
				this.asset_TeamBlue_Front = this.add.rectangle(10000, 300, 10, this.game_settings.paddle_size_h, 0x000000).setOrigin(1,0.5);
				this.asset_TeamRed_Front = this.add.rectangle((10000), 300, 10, this.game_settings.paddle_size_h, 0x000000).setOrigin(0,0.5);
			
			}
			
		}

		let style: Phaser.Types.GameObjects.Text.TextStyle = 
		{
			fontSize: '32px',
			color: '#000000',
			fontFamily: 'Arial'
		}

		let text: string;
		text = this.game_state.score.TeamBlue.toString() + " - " + this.game_state.score.TeamRed.toString();
		this.asset_scoreboard = this.add.text(10000, 100, text, style);


		if (this.me !== PlayerType.Spectator)
		{
			this.key_UP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
			this.key_DOWN = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
		}

		this.socketmanager?.game_get_round_setup(this.game_id!);

		if (this.core !== undefined)
		{
			// this.core.set_pong_triggers({
			// 	sound_event_wall: this.sound_event_wall.bind(this),
			// 	sound_event_paddle: this.sound_event_paddle.bind(this),
			// 	sound_event_goal: this.sound_event_goal.bind(this)
			// });
		}

		this.place_assets();

		clearInterval(this.update_interval);
		this.update_interval = setInterval(
		  (function(self) { return function()
			{
				self.frame_advance();
			}; })(this),
		  1000 / 60);
	}


	place_assets()
	{
		if (this.game_settings)
		{
			// this.asset_lag_icon!.x = 400;
			this.asset_ball!.x = 400;
			this.upper_limit!.x = 0;
			this.lower_limit!.x = 0;

			this.asset_TeamBlue_Back!.x = this.game_settings.player_back_advance;
			this.asset_TeamRed_Back!.x = (600 - this.game_settings.player_back_advance); 
			this.asset_scoreboard!.x = 400;
			if (this.game_type === GameType.Doubles)
			{
				this.asset_TeamBlue_Front!.x = this.game_settings.player_front_advance;
				this.asset_TeamRed_Front!.x = (600 - this.game_settings.player_front_advance);
			}
		}
	}

	frame_advance()
	{

		if (this.frame_count === 0)
		{
			this.frame_count++;
		//	this.place_assets();
			return;
		}
		else if (this.frame_count === 1)
		{
			this.asset_TeamBlue_Back!.x = this.game_state.TeamBlue_Back.x;
			this.asset_TeamBlue_Back!.y = this.game_state.TeamBlue_Back.y;
			this.asset_TeamRed_Back!.x = this.game_state.TeamRed_Back.x;
			this.asset_TeamRed_Back!.y = this.game_state.TeamRed_Back.y;
			this.asset_ball!.x = this.game_state.balldata.position.x;
			this.asset_ball!.y = this.game_state.balldata.position.y;

			if (this.game_type === GameType.Doubles)
			{
				this.asset_TeamBlue_Front!.x = this.game_state.TeamBlue_Front.x;
				this.asset_TeamBlue_Front!.y = this.game_state.TeamBlue_Front.y;
				this.asset_TeamRed_Front!.x = this.game_state.TeamRed_Front.x;
				this.asset_TeamRed_Front!.y = this.game_state.TeamRed_Front.y;
			}
			this.frame_count++;
			return;
		}


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
			this.socketmanager?.game_send_input(this.game_id!, player_input);
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
	
				if (this.me === PlayerType.TeamBlue_Back)
				{
					last_serv = elem.last_processed_id_A_Back;
				}
				else if (this.me === PlayerType.TeamRed_Back)
				{
					last_serv = elem.last_processed_id_B_Back;
				}
				else if (this.game_type === GameType.Doubles)
				{
					if (this.me === PlayerType.TeamBlue_Front)
					{
						last_serv = elem.last_processed_id_A_Front;
					}
					else if (this.me === PlayerType.TeamRed_Front)
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
			//no response from server
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

		//Display

		if (this.game_type === GameType.Singles)
			this.display_singles();
		else
			this.display_doubles();

		if (this.asset_scoreboard !== undefined)
		{
			let text: string;
			text = this.game_state.score.TeamBlue.toString() + " - " + this.game_state.score.TeamRed.toString();
			this.asset_scoreboard?.setText(text);
		}

//		this.lag_check();
	}


	apply_round_setup = (round_setup: RoundSetup) =>
	{
		this.next_round_setup = round_setup;
	}

	append_server_gamestate = (gamestate: GameState) =>
	{
		this.server_stock.push(gamestate);
	}

	// lag_check = () =>
	// {
	// 	if (this.is_lagging && this.game_state.result === EndResult.Undecided)
	// 		this.asset_lag_icon!.setAlpha(1);
	// 	else
	// 		this.asset_lag_icon!.setAlpha(0);
	// }

	game_end = (winner: EndResult) =>
	{
		this.game.registry.set('winner', winner);
		clearInterval(this.update_interval);

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

		if ( this.asset_TeamBlue_Back !== undefined
			&& this.asset_TeamRed_Back !== undefined
			&& this.asset_ball !== undefined )
		{
			if (this.me === PlayerType.TeamBlue_Back)
			{
				this.asset_TeamBlue_Back.x = this.game_state.TeamBlue_Back.x;
				this.asset_TeamBlue_Back.y = this.game_state.TeamBlue_Back.y;
			}
			else if (new Date(this.past_stock[0].send_date).getTime() > past_date.getTime())
			{
				this.asset_TeamBlue_Back.x = this.past_stock[0].TeamBlue_Back.x;
				this.asset_TeamBlue_Back.y = this.past_stock[0].TeamBlue_Back.y;
				used_past = true;
			}
			else
			{
				this.asset_TeamBlue_Back.x = this.game_state.TeamBlue_Back.x;
				this.asset_TeamBlue_Back.y = this.game_state.TeamBlue_Back.y;
			}


			if (this.me === PlayerType.TeamRed_Back)
			{
				this.asset_TeamRed_Back.x = this.game_state.TeamRed_Back.x;
				this.asset_TeamRed_Back.y = this.game_state.TeamRed_Back.y;
			}
			else if (new Date(this.past_stock[0].send_date).getTime() > past_date.getTime())
			{
				this.asset_TeamRed_Back.x = this.past_stock[0].TeamRed_Back.x;
				this.asset_TeamRed_Back.y = this.past_stock[0].TeamRed_Back.y;
				used_past = true;
			}
			else
			{
				this.asset_TeamRed_Back.x = this.game_state.TeamRed_Back.x;
				this.asset_TeamRed_Back.y = this.game_state.TeamRed_Back.y;
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
		
		if ( this.asset_TeamBlue_Back !== undefined
			&& this.asset_TeamRed_Back !== undefined
			&& this.asset_TeamBlue_Front !== undefined
			&& this.asset_TeamRed_Front !== undefined
			&& this.asset_ball !== undefined )
		{
		
			if (this.me === PlayerType.TeamBlue_Back)
			{
				this.asset_TeamBlue_Back.x = this.game_state.TeamBlue_Back.x;
				this.asset_TeamBlue_Back.y = this.game_state.TeamBlue_Back.y;
			}
			else if (new Date(this.past_stock[0].send_date).getTime() > past_date.getTime())
			{
				this.asset_TeamBlue_Back.x = this.past_stock[0].TeamBlue_Back.x;
				this.asset_TeamBlue_Back.y = this.past_stock[0].TeamBlue_Back.y;
				used_past = true;
			}
			else
			{
				this.asset_TeamBlue_Back.x = this.game_state.TeamBlue_Back.x;
				this.asset_TeamBlue_Back.y = this.game_state.TeamBlue_Back.y;
			}


			if (this.me === PlayerType.TeamRed_Back)
			{
				this.asset_TeamRed_Back.x = this.game_state.TeamRed_Back.x;
				this.asset_TeamRed_Back.y = this.game_state.TeamRed_Back.y;
			}
			else if (new Date(this.past_stock[0].send_date).getTime() > past_date.getTime())
			{
				this.asset_TeamRed_Back.x = this.past_stock[0].TeamRed_Back.x;
				this.asset_TeamRed_Back.y = this.past_stock[0].TeamRed_Back.y;
				used_past = true;
			}
			else
			{
				this.asset_TeamRed_Back.x = this.game_state.TeamRed_Back.x;
				this.asset_TeamRed_Back.y = this.game_state.TeamRed_Back.y;
			}

			if (this.me === PlayerType.TeamBlue_Front)
			{
				this.asset_TeamBlue_Front.x = this.game_state.TeamBlue_Front.x;
				this.asset_TeamBlue_Front.y = this.game_state.TeamBlue_Front.y;
			}
			else if (new Date(this.past_stock[0].send_date).getTime() > past_date.getTime())
			{
				this.asset_TeamBlue_Front.x = this.past_stock[0].TeamBlue_Front.x;
				this.asset_TeamBlue_Front.y = this.past_stock[0].TeamBlue_Front.y;
				used_past = true;
			}
			else
			{
				this.asset_TeamBlue_Front.x = this.game_state.TeamBlue_Front.x;
				this.asset_TeamBlue_Front.y = this.game_state.TeamBlue_Front.y;
			}


			if (this.me === PlayerType.TeamRed_Front)
			{
				this.asset_TeamRed_Front.x = this.game_state.TeamRed_Front.x;
				this.asset_TeamRed_Front.y = this.game_state.TeamRed_Front.y;
			}
			else if (new Date(this.past_stock[0].send_date).getTime() > past_date.getTime())
			{
				this.asset_TeamRed_Front.x = this.past_stock[0].TeamRed_Front.x;
				this.asset_TeamRed_Front.y = this.past_stock[0].TeamRed_Front.y;
				used_past = true;
			}
			else
			{
				this.asset_TeamRed_Front.x = this.game_state.TeamRed_Front.x;
				this.asset_TeamRed_Front.y = this.game_state.TeamRed_Front.y;
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

	// sound_event_wall = () =>
	// {
	// 	this.sound.stopAll();
	// 	this.sound_a.play();
	// }

	// sound_event_paddle = () =>
	// {
	// 	this.sound.stopAll();
	// 	this.sound_b.play();
	// }

	// sound_event_goal = () =>
	// {
	// 	this.sound.stopAll();
	// 	this.sound_clapping.play();
	// }
}
