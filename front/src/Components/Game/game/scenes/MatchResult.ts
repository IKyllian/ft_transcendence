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
	game_type: GameType = GameType.Singles;

	TeamBlue_Back_name: string = "";
	TeamBlue_Front_name: string = "";
	TeamRed_Front_name: string = "";
	TeamRed_Back_name: string = "";


	//Displayed elements
	TeamBlue_Back_avatar?: Phaser.GameObjects.Image;
	TeamBlue_Front_avatar?: Phaser.GameObjects.Image;
	TeamRed_Front_avatar?: Phaser.GameObjects.Image;
	TeamRed_Back_avatar?: Phaser.GameObjects.Image;

	result_text?: Phaser.GameObjects.Text;
	close_button?: Phaser.GameObjects.Image;
	//replay_button?: Phaser.GameObjects.Image;

	preload ()
	{
		this.load.image(
			'TeamBlue_back_avatar',
			this.game.registry.get('players_data').TeamBlue_Back.avatar
			);
		this.load.image(
			'TeamRed_back_avatar',
			this.game.registry.get('players_data').TeamRed_Back.avatar
			);
		this.load.image(
			'button',
			'assets/button.png'
			);

		this.game_type = this.game.registry.get('players_data').game_settings.game_type;

		if (this.game_type === GameType.Doubles)
		{
			this.load.image(
				'TeamBlue_front_avatar',
				this.game.registry.get('players_data').TeamBlue_Front.avatar
				);
			this.load.image(
				'TeamRed_front_avatar',
				this.game.registry.get('players_data').TeamRed_Front.avatar
				);


		}

		this.scene.remove('Pong');
	}

	create ()
	{
		this.me = this.game.registry.get('players_data').player_type;

		this.TeamBlue_Back_name = this.game.registry.get('players_data').TeamBlue_Back.name;
		this.TeamRed_Back_name = this.game.registry.get('players_data').TeamRed_Back.name;
		this.winner = this.game.registry.get('winner');
		
		this.TeamBlue_Back_avatar = this.add.image(130, 130, 'TeamBlue_back_avatar')
								.setOrigin(0.5,0.5)
								.setDisplaySize(150, 150);
		this.TeamRed_Back_avatar = this.add.image(670, 130, 'TeamRed_back_avatar')
								.setOrigin(0.5,0.5)
								.setDisplaySize(150, 150);
		if (this.game_type === GameType.Doubles)
		{
			this.TeamBlue_Front_name = this.game.registry.get('players_data').TeamBlue_Front.name;
			this.TeamRed_Front_name = this.game.registry.get('players_data').TeamRed_Front.name;
			this.TeamBlue_Front_avatar = this.add.image(260, 130, 'TeamBlue_front_avatar')
								.setOrigin(0.5,0.5)
								.setDisplaySize(150, 150);
			this.TeamRed_Front_avatar = this.add.image(670, 130, 'TeamRed_front_avatar')
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
				if (this.winner === EndResult.TeamBlue_Win)
				{
					text = this.TeamBlue_Back_name + " Wins";
				}
				else
				{
					text = this.TeamRed_Back_name + " Wins";
				}
			}
			else if ((this.me === PlayerType.TeamBlue_Back && this.winner === EndResult.TeamBlue_Win)
					|| (this.me === PlayerType.TeamRed_Back && this.winner === EndResult.TeamRed_Win))
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
				if (this.winner === EndResult.TeamBlue_Win)
				{
					text = "Team" + this.TeamBlue_Back_name + " and " + this.TeamBlue_Front_name + " Wins";
				}
				else
				{
					text = "Team" + this.TeamRed_Back_name + " and " + this.TeamRed_Front_name + " Wins";
				}
			}
			else if (((this.me === PlayerType.TeamBlue_Back || this.me === PlayerType.TeamBlue_Front)
					&& this.winner === EndResult.TeamBlue_Win)
					||
					((this.me === PlayerType.TeamRed_Back || this.me === PlayerType.TeamRed_Front)
					&& this.winner === EndResult.TeamRed_Win))
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

		setTimeout(() => {
			this.game.destroy(true, false);
		}, 10000);

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
