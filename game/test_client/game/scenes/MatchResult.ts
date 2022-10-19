import 'phaser';
import { EndResult, PlayerType } from '../types/shared.types';



export default class MatchResult extends Phaser.Scene
{
	constructor ()
	{
		super({ key: 'MatchResult' });
	}

	winner: EndResult = EndResult.Undecided;
	me: PlayerType = PlayerType.Spectator;

	player_A_name: string = "";
	player_A_win: number = 0;
	player_A_loss: number = 0;

	player_B_name: string = "";
	player_B_win: number = 0;
	player_B_loss: number = 0;

	//Displayed elements
	player_A_avatar?: Phaser.GameObjects.Image;
	player_B_avatar?: Phaser.GameObjects.Image;
	result_text?: Phaser.GameObjects.Text;
	close_button?: Phaser.GameObjects.Image;

	preload ()
	{
		this.load.image(
			'player_a_avatar',
			this.game.registry.get('players_data').player_A.avatar
			);
		this.load.image(
			'player_b_avatar',
			this.game.registry.get('players_data').player_B.avatar
			);
		this.load.image(
			'button',
			'assets/button.png'
			); 
	}

	create ()
	{
		this.me = this.game.registry.get('players_data').playertype;
		this.player_A_name = this.game.registry.get('players_data').player_A.name;
		this.player_B_name = this.game.registry.get('players_data').player_B.name;
		this.winner = this.game.registry.get('winner');
		
		this.player_A_avatar = this.add.image(130, 130, 'player_a_avatar')
								.setOrigin(0.5,0.5)
								.setDisplaySize(200, 200);
		this.player_B_avatar = this.add.image(670, 130, 'player_b_avatar')
								.setOrigin(0.5,0.5)
								.setDisplaySize(200, 200);
		this.close_button = this.add.image(400, 400, 'button')
								.setOrigin(0.5,0.5)
								.setDisplaySize(200, 200)
								.setName('close')
								.setInteractive();
		let style: Phaser.Types.GameObjects.Text.TextStyle = 
		{
			fontSize: '32px',
			color: '#000000',
			fontFamily: 'Arial'
		}

		let text: string;
		if(this.me === PlayerType.Spectator)
		{
			if (this.winner === EndResult.Player_A_Win)
			{
				text = this.player_A_name + " Wins";
			}
			else
			{
				text = this.player_B_name + " Wins";
			}
		}
		else if ((this.me === PlayerType.Player_A && this.winner === EndResult.Player_A_Win)
				|| (this.me === PlayerType.Player_B && this.winner === EndResult.Player_B_Win))
		{
			text = "You Won";
		}
		else
		{
			text = "You Lost";
		}

		this.result_text = this.add.text(400, 100, text, style);


		if (this.winner === EndResult.Player_A_Win)
		{
			this.player_A_win = this.game.registry.get('players_data').player_A.win + 1;
			this.player_A_loss = this.game.registry.get('players_data').player_A.loss;
			this.player_B_win = this.game.registry.get('players_data').player_B.win;
			this.player_B_loss = this.game.registry.get('players_data').player_B.loss + 1;
		}
		else
		{
			this.player_A_win = this.game.registry.get('players_data').player_A.win;
			this.player_A_loss = this.game.registry.get('players_data').player_A.loss + 1;
			this.player_B_win = this.game.registry.get('players_data').player_B.win + 1;
			this.player_B_loss = this.game.registry.get('players_data').player_B.loss;
		}

		this.add.text(100, 320, "Win:" + this.player_A_win, style);
		this.add.text(100, 360, "Loss:" + this.player_A_loss, style);
		this.add.text(600, 320, "Win:" + this.player_B_win, style);
		this.add.text(600, 360, "Loss:" + this.player_B_loss, style);

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
	}

}
