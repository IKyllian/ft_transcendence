import { BallData, Coordinates, EndResult, GameSettings, GameState, GameType, Goal, Movement, Player, PlayerInput, PlayerType, RoundSetup, ScoreBoard } from "../types/shared.types";

//paddle designations
//paddle A_back  ( [I] I    I  I  )
//paddle A_front (  I [I]   I  I  )
//paddle B_front (  I  I   [I] I  )
//paddle B_back  (  I  I    I [I] )

export default class PongCore
{
	//Modifiable Game Settings
	game_type: GameType = GameType.Singles; //(enum)Singles or Doubles
	up_down_border: number = 20; //pixels
	player_back_advance: number = 20;
	player_front_advance: number = 60;
	paddle_size_h: number = 150; //pixels
	paddle_speed: number = 13; // pixels per update
	ball_start_speed: number = 5; //pixels per update
	ball_acceleration: number = 1; //pixels per update per collision
	point_for_victory: number = 2;

	//Core Game Settings
	field_width: number = 800; //pixels
	field_height: number = 600; //pixels
	update_rate: number = 60; //per second
	round_delay: number = 4; //seconds

	//Game State
	goal: Goal = Goal.None;
	score_board: ScoreBoard =
	{
		Team_A: 0,
		Team_B: 0
	};

	
	previous_ball_pos: Coordinates = { x: ( this.field_width / 2 ), y: ( this.field_height / 2 ) };
	ball_data: BallData =
	{
		position: { x: ( this.field_width / 2 ), y: ( this.field_height / 2 ) },
		velocity: this.ball_start_speed,
		vector: { x: 0, y: 0 }
	}

	Player_A_Back_pos: Coordinates =
	{
		x: this.player_back_advance,
		y: ( this.field_height / 2 )
	};
	last_processed_id_A_Back: number = 0;
	
	Player_A_Front_pos: Coordinates =
	{ 
		x: ( this.field_width - this.player_back_advance ),
		y: ( this.field_height / 2 )
	};
	last_processed_id_A_Front: number = 0;

	Player_B_Front_pos: Coordinates =
	{ 
		x: ( this.field_width - this.player_back_advance ),
		y: ( this.field_height / 2 )
	};
	last_processed_id_B_Front: number = 0;

	Player_B_Back_pos: Coordinates =
	{ 
		x: ( this.field_width - this.player_back_advance ),
		y: ( this.field_height / 2 )
	};
	last_processed_id_B_Back: number = 0;

	playing: boolean = false;
	player_inputstock: Array<PlayerInput> = new Array();
	result: EndResult
	next_round_setup: RoundSetup | undefined = undefined;	

	constructor(public game_settings: GameSettings)
	{
		this.game_type = game_settings.game_type;
		this.up_down_border = game_settings.up_down_border;
		this.player_back_advance = game_settings.player_back_advance;
		this.player_front_advance = game_settings.player_front_advance;
		this.paddle_size_h = game_settings.paddle_size_h;
		this.paddle_speed = game_settings.paddle_speed;
		this.ball_start_speed = game_settings.ball_start_speed;
		this.ball_acceleration = game_settings.ball_acceleration;
		this.point_for_victory = game_settings.point_for_victory;
    }

	get_round_setup = (): RoundSetup =>
	{
		return this.next_round_setup!;
	}

	do_round_setup = (): RoundSetup =>
	{
		this.goal = Goal.None;
		this.ball_data =
		{
			position: { x: ( this.field_width / 2 ), y: ( this.field_height / 2 ) },
			velocity: this.ball_start_speed,
			vector: { x: 0, y: 0 }
		}

		this.Player_A_Back_pos =
		{
			x: this.player_back_advance,
			y: ( this.field_height / 2 )
		};

		this.Player_B_Back_pos =
		{ 
			x: ( this.field_width - this.player_back_advance ),
			y: ( this.field_height / 2 )
		};

		if (this.game_type === GameType.Doubles)
		{
			this.Player_A_Front_pos =
			{ 
				x: ( this.field_width - this.player_back_advance ),
				y: ( this.field_height / 2 )
			};
	
			this.Player_B_Front_pos =
			{ 
				x: ( this.field_width - this.player_back_advance ),
				y: ( this.field_height / 2 )
			};	
		}

		this.playing = false;

		//purge input table
		this.player_inputstock = [];

		let t: Date = new Date();
		let rd: number = Math.floor(Math.random() * (8 - 1 + 1)) + 1;
		
		//add delay to next round
		t.setSeconds(t.getSeconds() + this.round_delay);

		let vec: Coordinates = { x: 0, y: 0 };

		switch(rd)
		{
			case 1:
				vec.x = 0.75;
				vec.y = 0.75;				
				break;
			case 2:
				vec.x = 0.75;
				vec.y = -0.75;
				break;
			case 3:
				vec.x = -0.75;
				vec.y = 0.75;
				break;
			case 4:
				vec.x = -0.75;
				vec.y = -0.75;
				break;
			case 5:
				vec.x = -0.9;
				vec.y = -0.4;
				break;
			case 6:
				vec.x = -0.9;
				vec.y = 0.4;
				break;
			case 7:
				vec.x = 0.9;
				vec.y = -0.4;
				break;
			case 8:
				vec.x = 0.9;
				vec.y = 0.4;
				break;
			default:
				vec.x = 1;
				vec.y = 0;
				break;
		}

		this.ball_data.vector = vec;

		let ret: RoundSetup =
		{
			start_time: t,
			vector: vec
		}

		this.next_round_setup = ret;
		return ret;
	}

	append_input = (input: PlayerInput) =>
	{
		this.player_inputstock.push(input);
	}

	apply_gamestate = (game_state: GameState) =>
	{
		this.game_type = game_state.game_type;
		this.result = game_state.result;
		this.goal = game_state.goal;
		this.score_board = game_state.score;
		this.ball_data = game_state.balldata;

		this.Player_A_Back_pos = game_state.Player_A_Back;
		this.Player_A_Front_pos = game_state.Player_A_Front;
		this.Player_B_Front_pos = game_state.Player_B_Front;
		this.Player_B_Back_pos = game_state.Player_B_Back;
		this.last_processed_id_A_Back = game_state.last_processed_id_A_Back;
		this.last_processed_id_A_Front = game_state.last_processed_id_A_Front;
		this.last_processed_id_B_Front = game_state.last_processed_id_B_Front;
		this.last_processed_id_B_Back = game_state.last_processed_id_A_Back;
	}

	get_gamestate = (): GameState =>
	{
		let ret: GameState =
		{
			game_type: this.game_type,
			result: this.result,
			goal: this.goal,
			score: this.score_board,
			balldata: this.ball_data,

			Player_A_Back: this.Player_A_Back_pos,
			Player_A_Front: this.Player_A_Front_pos,
			Player_B_Front: this.Player_B_Front_pos,
			Player_B_Back: this.Player_B_Back_pos,
			last_processed_id_A_Back: this.last_processed_id_A_Back,
			last_processed_id_A_Front: this.last_processed_id_A_Front,
			last_processed_id_B_Front: this.last_processed_id_B_Front,
			last_processed_id_B_Back: this.last_processed_id_B_Back,
			send_date: new Date()
		};

		return ret;
	}


	update_gamestate = () =>
	{
		let now: Date = new Date();
		if (this.next_round_setup === undefined)
			return;
		this.player_inputstock = this.player_inputstock.sort((a, b) => {
			if (new Date(a.time).getTime() > new Date(b.time).getTime()) {
				return 1;
			}	
			if(new Date(a.time).getTime() < new Date(b.time).getTime())  {
				return -1;
			}
			return 0;
		});

		this.player_inputstock.forEach(function(elem: PlayerInput)
		{
			this.apply_input(elem);
		}, this);
		this.player_inputstock = [];

		if (new Date(this.next_round_setup.start_time).getTime() > now.getTime())
			return;

		this.move_ball();
		this.check_goal();
	}

	move_ball = () =>
	{
		this.previous_ball_pos = this.ball_data.position;
		this.ball_data.position.x += this.ball_data.vector.x * this.ball_data.velocity;
		this.ball_data.position.y += this.ball_data.vector.y * this.ball_data.velocity;

		//check up wall
		if (this.ball_data.position.y <= this.up_down_border)
		{
			this.ball_data.position.y = this.up_down_border;
			this.ball_data.vector.y *= -1;
	//		this.ball_data.velocity += this.ball_acceleration;
		}
		//check down wall
		if (this.ball_data.position.y >= (this.field_height - this.up_down_border))
		{
			this.ball_data.position.y = (this.field_height - this.up_down_border);
			this.ball_data.vector.y *= -1;
	//		this.ball_data.velocity += this.ball_acceleration;
		}

		//check paddle A_back ( [I] I   I I )
		if (this.ball_data.position.x <= this.player_back_advance 
			&& this.previous_ball_pos.x > this.player_back_advance)
		{

			if (this.ball_data.position.y < (this.Player_A_Back_pos.y + (this.paddle_size_h / 2))
			&& this.ball_data.position.y > (this.Player_A_Back_pos.y - (this.paddle_size_h / 2)))
			{

				this.ball_data.position.x = this.player_back_advance;
				this.ball_data.vector.x *= -1;	
//TODO
//do something cool with vectors for bounce
				this.ball_data.velocity += this.ball_acceleration;


			}


		}

		//check paddle B_back ( I I   I [I] )
		if (this.ball_data.position.x >= (this.field_width - this.player_back_advance)
			&& this.previous_ball_pos.x < (this.field_width - this.player_back_advance))
		{
			if (this.ball_data.position.y < (this.Player_B_Back_pos.y + (this.paddle_size_h / 2))
			&& this.ball_data.position.y > (this.Player_B_Back_pos.y - (this.paddle_size_h / 2)))
			{
				this.ball_data.position.x = this.player_back_advance;
				this.ball_data.vector.x *= -1;	
//TODO
//do something cool with vectors for bounce
				this.ball_data.velocity += this.ball_acceleration;
			}
		}	


		if (this.game_type === GameType.Doubles)
		{
			//check paddle A_front ( I [I]   I I )
			if (this.ball_data.position.x <= this.player_front_advance 
				&& this.previous_ball_pos.x > this.player_front_advance)
			{
				if (this.ball_data.position.y < (this.Player_A_Front_pos.y + (this.paddle_size_h / 2))
				&& this.ball_data.position.y > (this.Player_A_Front_pos.y - (this.paddle_size_h / 2)))
				{
					this.ball_data.position.x = this.player_front_advance;
					this.ball_data.vector.x *= -1;	
	//TODO
	//do something cool with vectors for bounce
					this.ball_data.velocity += this.ball_acceleration;
				}
			}
	
			//check paddle B_front ( I I   [I] I )
			if (this.ball_data.position.x >= (this.field_width - this.player_front_advance)
				&& this.previous_ball_pos.x < (this.field_width - this.player_front_advance))
			{
				if (this.ball_data.position.y < (this.Player_B_Front_pos.y + (this.paddle_size_h / 2))
				&& this.ball_data.position.y > (this.Player_B_Front_pos.y - (this.paddle_size_h / 2)))
				{
					this.ball_data.position.x = this.player_front_advance;
					this.ball_data.vector.x *= -1;	
	//TODO
	//do something cool with vectors for bounce
					this.ball_data.velocity += this.ball_acceleration;
				}
			}
		}
	}

	apply_input = (input: PlayerInput) =>
	{
		if (input.player_type === PlayerType.Player_A_Back)
		{
			if (input.movement === Movement.Up)
			{
				if (this.Player_A_Back_pos.y >= (this.up_down_border + (this.paddle_size_h / 2)))
				{
					this.Player_A_Back_pos.y -= this.paddle_speed;
					if (this.Player_A_Back_pos.y < (this.up_down_border + (this.paddle_size_h / 2)))
						this.Player_A_Back_pos.y = (this.up_down_border + (this.paddle_size_h / 2));
				}
			}
			else if (input.movement === Movement.Down)
			{
				if (this.Player_A_Back_pos.y <= (this.field_height - this.up_down_border - (this.paddle_size_h / 2)))
				{
					this.Player_A_Back_pos.y += this.paddle_speed;
					if (this.Player_A_Back_pos.y > (this.field_height - this.up_down_border - (this.paddle_size_h / 2)))
						this.Player_A_Back_pos.y = (this.field_height - this.up_down_border - (this.paddle_size_h / 2));
				}
			}
			this.last_processed_id_A_Back = input.number;
		}
		else if (input.player_type === PlayerType.Player_B_Back)
		{
			if (input.movement === Movement.Up)
			{
				if (this.Player_B_Back_pos.y >= (this.up_down_border + (this.paddle_size_h / 2)))
				{
					this.Player_B_Back_pos.y -= this.paddle_speed;
					if (this.Player_B_Back_pos.y < (this.up_down_border + (this.paddle_size_h / 2)))
						this.Player_B_Back_pos.y = (this.up_down_border + (this.paddle_size_h / 2));
				}
			}
			else if (input.movement === Movement.Down)
			{
				if (this.Player_B_Back_pos.y <= (this.field_height - this.up_down_border - (this.paddle_size_h / 2)))
				{
					this.Player_B_Back_pos.y += this.paddle_speed;
					if (this.Player_B_Back_pos.y > (this.field_height - this.up_down_border - (this.paddle_size_h / 2)))
						this.Player_B_Back_pos.y = (this.field_height - this.up_down_border - (this.paddle_size_h / 2));
				}
			}
			this.last_processed_id_B_Back = input.number;
		}


		if (this.game_type === GameType.Doubles)
		{
			if (input.player_type === PlayerType.Player_A_Front)
			{
				if (input.movement === Movement.Up)
				{
					if (this.Player_A_Front_pos.y >= (this.up_down_border + (this.paddle_size_h / 2)))
					{
						this.Player_A_Front_pos.y -= this.paddle_speed;
						if (this.Player_A_Front_pos.y < (this.up_down_border + (this.paddle_size_h / 2)))
							this.Player_A_Front_pos.y = (this.up_down_border + (this.paddle_size_h / 2));
					}
				}
				else if (input.movement === Movement.Down)
				{
					if (this.Player_A_Front_pos.y <= (this.field_height - this.up_down_border - (this.paddle_size_h / 2)))
					{
						this.Player_A_Front_pos.y += this.paddle_speed;
						if (this.Player_A_Front_pos.y > (this.field_height - this.up_down_border - (this.paddle_size_h / 2)))
							this.Player_A_Front_pos.y = (this.field_height - this.up_down_border - (this.paddle_size_h / 2));
					}
				}
				this.last_processed_id_A_Front = input.number;
			}
			else if (input.player_type === PlayerType.Player_B_Front)
			{
				if (input.movement === Movement.Up)
				{
					if (this.Player_B_Front_pos.y >= (this.up_down_border + (this.paddle_size_h / 2)))
					{
						this.Player_B_Front_pos.y -= this.paddle_speed;
						if (this.Player_B_Front_pos.y < (this.up_down_border + (this.paddle_size_h / 2)))
							this.Player_B_Front_pos.y = (this.up_down_border + (this.paddle_size_h / 2));
					}
				}
				else if (input.movement === Movement.Down)
				{
					if (this.Player_B_Front_pos.y <= (this.field_height - this.up_down_border - (this.paddle_size_h / 2)))
					{
						this.Player_B_Front_pos.y += this.paddle_speed;
						if (this.Player_B_Front_pos.y > (this.field_height - this.up_down_border - (this.paddle_size_h / 2)))
							this.Player_B_Front_pos.y = (this.field_height - this.up_down_border - (this.paddle_size_h / 2));
					}
				}
				this.last_processed_id_B_Front = input.number;
			}

		}

	}

	//used only by server, client is forced to wait for server confirmation
	check_goal = () =>
	{
		this.goal = Goal.None;

		if (this.ball_data.position.x < 0)
		{
			this.goal = Goal.Team_B;
			this.score_board.Team_B += 1;
		}
		else if (this.ball_data.position.x > this.field_width)
		{
			this.goal = Goal.Team_A;
			this.score_board.Team_A += 1;
		}

		if (this.goal !== Goal.None)
		{
			//check score
			if (this.score_board.Team_A >= this.point_for_victory)
			{
				this.result = EndResult.Team_A_Win;
			}
			else if (this.score_board.Team_B >= this.point_for_victory)
			{
				this.result = EndResult.Team_B_Win;
			}
			else
			{
				this.do_round_setup();
			}
		}
	}
}