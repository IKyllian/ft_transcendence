import 'phaser';
import { EndResult, GameType, PlayerType } from '../types/shared.types';



export default class MatchResult extends Phaser.Scene
{
	constructor ()
	{
		super({ key: 'MatchResult' });
	}

	winner: EndResult = EndResult.Undecided;
	me: PlayerType = PlayerType.Spectator;
	game_type: GameType;

	Player_A_Back_name: string = "";
	Player_A_Front_name: string = "";
	Player_B_Front_name: string = "";
	Player_B_Back_name: string = "";


	//Displayed elements
	Player_A_Back_avatar?: Phaser.GameObjects.Image;
	Player_A_Front_avatar?: Phaser.GameObjects.Image;
	Player_B_Front_avatar?: Phaser.GameObjects.Image;
	Player_B_Back_avatar?: Phaser.GameObjects.Image;

	result_text?: Phaser.GameObjects.Text;
	close_button?: Phaser.GameObjects.Image;
	//replay_button?: Phaser.GameObjects.Image;

	preload ()
	{
		this.load.image(
			'player_a_back_avatar',
			this.game.registry.get('players_data').Player_A_Back.avatar
			);
		this.load.image(
			'player_b_back_avatar',
			this.game.registry.get('players_data').Player_B_Back.avatar
			);
		this.load.image(
			'button',
			'assets/button.png'
			);

		this.game_type = this.game.registry.get('players_data').game_settings.game_type;

		if (this.game_type === GameType.Doubles)
		{
			this.load.image(
				'player_a_front_avatar',
				this.game.registry.get('players_data').Player_A_Front.avatar
				);
			this.load.image(
				'player_b_front_avatar',
				this.game.registry.get('players_data').Player_B_Front.avatar
				);


		}
	}

	create ()
	{
		this.me = this.game.registry.get('players_data').player_type;

		this.Player_A_Back_name = this.game.registry.get('players_data').Player_A_Back.name;
		this.Player_B_Back_name = this.game.registry.get('players_data').Player_B_Back.name;
		this.winner = this.game.registry.get('winner');
		
		this.Player_A_Back_avatar = this.add.image(130, 130, 'player_a_back_avatar')
								.setOrigin(0.5,0.5)
								.setDisplaySize(150, 150);
		this.Player_B_Back_avatar = this.add.image(670, 130, 'player_b_back_avatar')
								.setOrigin(0.5,0.5)
								.setDisplaySize(150, 150);
		if (this.game_type === GameType.Doubles)
		{
			this.Player_A_Front_name = this.game.registry.get('players_data').Player_A_Front.name;
			this.Player_B_Front_name = this.game.registry.get('players_data').Player_B_Front.name;
			this.Player_A_Front_avatar = this.add.image(260, 130, 'player_a_front_avatar')
								.setOrigin(0.5,0.5)
								.setDisplaySize(150, 150);
			this.Player_B_Front_avatar = this.add.image(670, 130, 'player_b_front_avatar')
								.setOrigin(0.5,0.5)
								.setDisplaySize(150, 150);
		}

		this.close_button = this.add.image(400, 400, 'button')
								.setOrigin(0.5,0.5)
								.setDisplaySize(200, 200)
								.setName('close')
								.setInteractive();
		// this.replay_button = this.add.image(500, 400, 'button')
		// 						.setOrigin(0.5,0.5)
		// 						.setDisplaySize(200, 200)
		// 						.setName('replay')
		// 						.setInteractive();

		let style: Phaser.Types.GameObjects.Text.TextStyle = 
		{
			fontSize: '32px',
			color: '#000000',
			fontFamily: 'Arial'
		}

		let text: string;


		if(this.game_type === GameType.Singles)
		{
			if(this.me === PlayerType.Spectator)
			{
				if (this.winner === EndResult.Team_A_Win)
				{
					text = this.Player_A_Back_name + " Wins";
				}
				else
				{
					text = this.Player_B_Back_name + " Wins";
				}
			}
			else if ((this.me === PlayerType.Player_A_Back && this.winner === EndResult.Team_A_Win)
					|| (this.me === PlayerType.Player_B_Back && this.winner === EndResult.Team_B_Win))
			{
				text = "You Won";
			}
			else
			{
				text = "You Lost";
			}
		}
		else
		{
			if(this.me === PlayerType.Spectator)
			{
				if (this.winner === EndResult.Team_A_Win)
				{
					text = "Team" + this.Player_A_Back_name + " and " + this.Player_A_Front_name + " Wins";
				}
				else
				{
					text = "Team" + this.Player_B_Back_name + " and " + this.Player_B_Front_name + " Wins";
				}
			}
			else if (((this.me === PlayerType.Player_A_Back || this.me === PlayerType.Player_A_Front)
					&& this.winner === EndResult.Team_A_Win)
					||
					((this.me === PlayerType.Player_B_Back || this.me === PlayerType.Player_B_Front)
					&& this.winner === EndResult.Team_B_Win))
			{
				text = "Your Team Won";
			}
			else
			{
				text = "Your Team Lost";
			}		
		}


		this.result_text = this.add.text(400, 100, text, style);
		this.input.on('gameobjectdown',this.click_event);
	}

	click_event = (pointer: Phaser.Input.Pointer ,gameobject :Phaser.GameObjects.GameObject) =>
	{
		pointer;
		
		console.log("click", gameobject);
		if (gameobject.name === 'close')
		{
			gameobject.destroy();
			//close phaser
			this.game.destroy(true, false);
		}

		// if (gameobject.name === 'replay')
		// {
		// 	gameobject.destroy();
		// 	//close phaser
		// 	this.game.destroy(true, false);
		// }
	}

}
