import { BallData, Coordinates, EndResult, GameState, Goal, Movement, Player, PlayerInput, PlayerType, RoundSetup, ScoreBoard } from "./types/shared.types";


export default class PongCore
{

	//Game Settings
	field_width: number = 800; //pixels
	field_height: number = 600; //pixels
	up_down_border: number = 20; //pixels
	goalkeep_advance: number = 20; //pixels
	paddle_size_h: number = 150; //pixels
	paddle_speed: number = 13; // pixels per update
	//padde_size_w: number = 20; 
	//ball_size: number = 10; //pixels
	ball_start_speed: number = 5; //pixels per update
	ball_acceleration: number = 1; //pixels per update per collision
	point_for_victory: number = 5;
	update_rate: number = 60; //per second
	round_delay: number = 4;



	//Derived Game Settings


	//Game State
	goal: Goal = Goal.None;
	score_board: ScoreBoard =
	{
		player_A: 0,
		player_B: 0
	};

	ball_data: BallData =
	{
		position: { x: ( this.field_width / 2 ), y: ( this.field_height / 2 ) },
		velocity: this.ball_start_speed,
		vector: { x: 0, y: 0 }
	}

	player_A_pos: Coordinates =
	{
		x: this.goalkeep_advance,
		y: ( this.field_height / 2 )
	};
	//player_A_mov: Movement = Movement.Neutral;
	last_processed_id_A: number = 0;
	//last_processed_time_A: Date = new Date();
	
	player_B_pos: Coordinates =
	{ 
		x: ( this.field_width - this.goalkeep_advance ),
		y: ( this.field_height / 2 )
	};
	//player_B_mov: Movement = Movement.Neutral;
	last_processed_id_B: number = 0;
	// player_B_inputstock: Array<PlayerInput> = new Array();
	//last_processed_time_B: Date = new Date();
	playing: boolean = false;
	player_inputstock: Array<PlayerInput> = new Array();
	result: EndResult
	//next_round_setup: RoundSetup | undefined = undefined;
	next_round_setup: RoundSetup | undefined = undefined;

	constructor()
	{

    }

	get_round_setup = (): RoundSetup =>
	{
		// if (this.next_round_setup !== undefined)
		// {

			return this.next_round_setup!;
		//}
		//return undefined;
	}

	do_round_setup = (): RoundSetup =>
	{
		// re-initialise everything needed
		this.goal = Goal.None;
		this.ball_data =
		{
			position: { x: ( this.field_width / 2 ), y: ( this.field_height / 2 ) },
			velocity: this.ball_start_speed,
			vector: { x: 0, y: 0 }
		}
		this.player_A_pos =
		{
			x: this.goalkeep_advance,
			y: ( this.field_height / 2 )
		};
		// this.player_A_mov = Movement.Neutral;
		this.player_B_pos =
		{ 
			x: ( this.field_width - this.goalkeep_advance ),
			y: ( this.field_height / 2 )
		};
		// this.player_B_mov = Movement.Neutral;
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

	apply_gamestate = (gamedata: GameState) =>
	{
		this.result = gamedata.result;
		this.goal = gamedata.goal;
		this.score_board = gamedata.score;
		this.ball_data = gamedata.balldata;
		this.player_A_pos = gamedata.player_A;
		this.last_processed_id_A = gamedata.last_processed_id_A;
		this.player_B_pos = gamedata.player_B;
		this.last_processed_id_B = gamedata.last_processed_id_B;
	}

	get_gamestate = (): GameState =>
	{
		let ret: GameState =
		{
			result: this.result,
			goal: this.goal,
			score: this.score_board,
			balldata: this.ball_data,
			player_A: this.player_A_pos,
			last_processed_id_A: this.last_processed_id_A,
			last_processed_time_A: new Date(),
			player_B: this.player_B_pos,
			last_processed_id_B: this.last_processed_id_B,
			last_processed_time_B: new Date()
		};

		return ret;
	}


	update_gamestate = () =>
	{
		let now: Date = new Date();
		if (this.next_round_setup === undefined)
			return;
		if (new Date(this.next_round_setup.start_time).getTime() > now.getTime())
			return;

			this.player_inputstock = this.player_inputstock.sort((a, b) => {
				if (new Date(a.time).getTime() > new Date(b.time).getTime()) {
					return 1;
				}	
				if(new Date(a.time).getTime() < new Date(b.time).getTime())  {
					return -1;
				}
				return 0;
		} );

		this.player_inputstock.forEach(function(elem: PlayerInput)
		{
			this.apply_input(elem);
		}, this);
		this.player_inputstock = [];

		if (new Date(this.next_round_setup.start_time).getTime() > now.getTime())
			return;

		this.move_ball();
	//	this.check_collisions();
		this.check_goal();
	}

	move_ball = () =>
	{
		this.ball_data.position.x += this.ball_data.vector.x * this.ball_data.velocity;
		this.ball_data.position.y += this.ball_data.vector.y * this.ball_data.velocity;


		//wall bounce are simple, paddle bounce depends on impact point (how ?)

		//check up wall
		if (this.ball_data.position.y <= this.up_down_border)
		{
			this.ball_data.position.y = this.up_down_border;
			this.ball_data.vector.y *= -1;
			this.ball_data.velocity += this.ball_acceleration;
		}
		//check down wall
		if (this.ball_data.position.y >= (this.field_height - this.up_down_border))
		{
			this.ball_data.position.y = (this.field_height - this.up_down_border);
			this.ball_data.vector.y *= -1;
			this.ball_data.velocity += this.ball_acceleration;
		}
		//check left paddle
		if (this.ball_data.position.x <= this.goalkeep_advance)
		{
			if (this.ball_data.position.y < (this.player_A_pos.y + (this.paddle_size_h / 2))
				&& this.ball_data.position.y > (this.player_A_pos.y - (this.paddle_size_h / 2)))
			{
				this.ball_data.position.x = (this.field_width - this.goalkeep_advance);
				this.ball_data.vector.x *= -1;

				//do something cool with vec y
				//this.ball_data.vector.y

				this.ball_data.velocity += this.ball_acceleration;
			}
		}
		//check right paddle

		if (this.ball_data.position.x >= (this.field_width - this.goalkeep_advance))
		{
			if (this.ball_data.position.y < (this.player_B_pos.y + (this.paddle_size_h / 2))
				&& this.ball_data.position.y > (this.player_B_pos.y - (this.paddle_size_h / 2)))
			{
				this.ball_data.position.x = this.goalkeep_advance;
				this.ball_data.vector.x *= -1;

				//do something cool with vec y
				//this.ball_data.vector.y

				this.ball_data.velocity += this.ball_acceleration;
			}
		}
	}

	apply_input = (input: PlayerInput) =>
	{
//console.log("on est la");
		if (input.playertype === PlayerType.Player_A)
		{
			if (input.movement === Movement.Up)
			{
				if (this.player_A_pos.y >= (this.up_down_border + (this.paddle_size_h / 2)))
				{
					this.player_A_pos.y -= this.paddle_speed;
					if (this.player_A_pos.y < (this.up_down_border + (this.paddle_size_h / 2)))
						this.player_A_pos.y = (this.up_down_border + (this.paddle_size_h / 2));
				}
			}
			else if (input.movement === Movement.Down)
			{
				if (this.player_A_pos.y <= (this.field_height - this.up_down_border - (this.paddle_size_h / 2)))
				{
					this.player_A_pos.y += this.paddle_speed;
					if (this.player_A_pos.y > (this.field_height - this.up_down_border - (this.paddle_size_h / 2)))
						this.player_A_pos.y = (this.field_height - this.up_down_border - (this.paddle_size_h / 2));
				}
			}
			this.last_processed_id_A = input.number;
		}
		else if (input.playertype === PlayerType.Player_B)
		{
			if (input.movement === Movement.Up)
			{
				if (this.player_B_pos.y >= (this.up_down_border + (this.paddle_size_h / 2)))
				{
					this.player_B_pos.y -= this.paddle_speed;
					if (this.player_B_pos.y < (this.up_down_border + (this.paddle_size_h / 2)))
						this.player_B_pos.y = (this.up_down_border + (this.paddle_size_h / 2));
				}
			}
			else if (input.movement === Movement.Down)
			{
				if (this.player_B_pos.y <= (this.field_height - this.up_down_border - (this.paddle_size_h / 2)))
				{
					this.player_B_pos.y += this.paddle_speed;
					if (this.player_B_pos.y > (this.field_height - this.up_down_border - (this.paddle_size_h / 2)))
						this.player_B_pos.y = (this.field_height - this.up_down_border - (this.paddle_size_h / 2));
				}
			}
			this.last_processed_id_B = input.number;
		}

		// this.check_goal();
		// this.check_collisions();
	}

	check_goal = () =>
	{
		let goal: boolean = false;
		//left
		if (this.ball_data.position.x < 0)
		{
			goal = true;
			this.score_board.player_B += 1;
		}

		//right
		if (this.ball_data.position.x > this.field_width)
		{
			goal = true;
			this.score_board.player_A += 1;
		}

		if (goal)
		{
			//check score
			if (this.score_board.player_A >= this.point_for_victory)
			{
				//playerA Win
				//end game
			}
			if (this.score_board.player_B >= this.point_for_victory)
			{
				//playerB Win
				//end game
			}
			//prepare next round

//disable if client
//wait for server ?
			this.do_round_setup();
		}
	}

	// check_collisions = () =>
	// {

	// }
}