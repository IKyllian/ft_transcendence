import 'phaser';
import { io } from "socket.io-client";
import ClientSocketManager from '../client.socket.manager';
import PongCore from '../pong.core';
import { GameState, Goal, Movement, Player, PlayerInput, PlayerType, BallData, EndResult, RoundSetup } from '../types/shared.types';

export default class ReplayPlayer extends Phaser.Scene
{

	constructor ()
	{
		super({ key: 'ReplayPlayer' });
	}
/*
	//me: PlayerType = PlayerType.Spectator;
	socketmanager: ClientSocketManager = new ClientSocketManager();
	//core: PongCore = new PongCore();
	game_id?: string;

	//Displayed elements
	asset_ball?: Phaser.GameObjects.Image;
	asset_player_A?: Phaser.GameObjects.Shape;
	asset_player_B?: Phaser.GameObjects.Shape;
	asset_scoreboard?: Phaser.GameObjects.Text;
	upper_limit?: Phaser.GameObjects.Shape;
	lower_limit?: Phaser.GameObjects.Shape;
	asset_lag_icon?: Phaser.GameObjects.Image;


	server_stock: Array<GameState> = new Array();
//	past_stock: Array<GameState> = new Array();


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

		this.game_id = this.registry.get('game_id');

		if (this.socketmanager !== undefined)
		{
			this.socketmanager.set_replay_triggers({
				append_server_gamestate: this.append_server_gamestate.bind(this),
	
			});

		}

		this.asset_ball = this.add.image(400, 300, 'ball');
		this.asset_player_A = this.add.rectangle(20, 300, 10, 150, 0x000000);
		this.asset_player_B = this.add.rectangle(580, 300, 10, 150, 0x000000);
		this.asset_lag_icon = this.add.image(400, 300, 'lag_icon');
		this.asset_lag_icon.setAlpha(1);

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

		this.socketmanager.request_replay(this.game_id!);
		clearInterval(this.update_interval);
		
		setTimeout(() => { 

			this.update_interval = setInterval(
			  (function(self) { return function()
				{
					self.frame_advance();
				}; })(this),
			  1000 / 60);

		}, 500);

	}


	frame_advance()
	{
		if (this.server_stock.length !== 0)
		{
			this.is_lagging = false;
			this.lag_count = 0;
			
			let past_date: Date = new Date();
			past_date.setMilliseconds(past_date.getMilliseconds() - 100);
	
			if ( this.asset_player_A !== undefined
				&& this.asset_player_B !== undefined
				&& this.asset_ball !== undefined )
				{
						this.asset_player_A.x = this.server_stock[0].player_A.x;
						this.asset_player_A.y = this.server_stock[0].player_A.y;
						this.asset_player_B.x = this.server_stock[0].player_B.x;
						this.asset_player_B.y = this.server_stock[0].player_B.y;
						this.asset_ball.x = this.server_stock[0].balldata.position.x;
						this.asset_ball.y = this.server_stock[0].balldata.position.y;
						this.game_state = this.server_stock[0];
						if (this.asset_scoreboard !== undefined)
						{
							let text: string;
							text = this.server_stock[0].score.player_A.toString() + " - " + this.server_stock[0].score.player_B.toString();
							this.asset_scoreboard?.setText(text);
						}
						this.server_stock.shift();
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
			//no responde from server
			if (this.game_state.result !== EndResult.Undecided)
			{
				console.log('test');
			}

			if(this.game_state.score.player_A >= 2 || this.game_state.score.player_B >= 2)
			{
				console.log("end of replay");
				clearInterval(this.update_interval);
			}
			else
			{
				
				this.lag_count++;
				if (this.lag_count >= 10)
				{
					this.is_lagging = true;
				}
			}
		}

		// if ( this.asset_player_A !== undefined
		// 		&& this.asset_player_B !== undefined
		// 		&& this.asset_ball !== undefined )
		// 		{
		// 			this.asset_player_A.x = this.game_state.player_A.x;
		// 			this.asset_player_A.y = this.game_state.player_A.y;
		// 			this.asset_player_B.x = this.game_state.player_B.x;
		// 			this.asset_player_B.y = this.game_state.player_B.y;
		// 			this.asset_ball.x = this.game_state.balldata.position.x;
		// 			this.asset_ball.y = this.game_state.balldata.position.y;	

		// 		}
		// 		if (this.asset_scoreboard !== undefined)
		// 		{
		// 			let text: string;
		// 			text = this.game_state.score.player_A.toString() + " - " + this.game_state.score.player_B.toString();
		// 			this.asset_scoreboard?.setText(text);
		// 		}
		this.lag_check();
	}


	append_server_gamestate = (gamestate: GameState) =>
	{
//console.log('appending replay state', this.server_stock.length);
		gamestate.last_processed_time_A = new Date();
		this.server_stock.push(gamestate);

//le bloc de la honte
// this.game_state = this.server_stock[0];
// this.server_stock.shift();

	}

	display_score = () =>
	{
		let text: string;
		text = this.game_state.score.player_A.toString() + " - " + this.game_state.score.player_B.toString();


		this.asset_scoreboard?.setText(text);
	}

	lag_check = () =>
	{
		if (this.is_lagging)
			this.asset_lag_icon!.setAlpha(1);
		else
			this.asset_lag_icon!.setAlpha(0);
	}


	game_end = (winner: EndResult) =>
	{
		this.game.registry.set('winner', winner);

		this.time.addEvent({
			delay: 1000,
			callback: function()
			{				
				this.scene.start('MatchResult');
			},
			callbackScope: this,
			loop: true });
	}
*/
}