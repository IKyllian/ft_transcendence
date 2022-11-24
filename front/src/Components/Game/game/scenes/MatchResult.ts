import 'phaser';
import { EndResult, GameType, PlayerType } from '../types/shared.types';
import AssetButton from '../../../../Assets/images/button.png';


// dans user
// @Column({ default: 1000 })
// singles_elo: number;

// @Column({ default: 1000 })
// doubles_elo: number;


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

	TeamBlue_Back_newElo: number = 0;
	TeamBlue_Front_newElo: number = 0;
	TeamRed_Front_newElo: number = 0;
	TeamRed_Back_newElo: number = 0;


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
			AssetButton
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


		this.eloDisplay();

		// console.log("TeamBlue_Back_newElo", this.TeamBlue_Back_newElo);
		// console.log("TeamBlue_front_newElo", this.TeamBlue_Front_newElo);
		// console.log("Teamred_front_newElo", this.TeamRed_Front_newElo);
		// console.log("Teamred_Back_newElo", this.TeamRed_Back_newElo);

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
			this.game.destroy(true, false);
		}
	}

	eloDisplay = () =>
	{
		let style_green: Phaser.Types.GameObjects.Text.TextStyle = 
		{
			fontSize: '32px',
			color: '#00FF00',
			fontFamily: 'Arial'
		}

		let style_red: Phaser.Types.GameObjects.Text.TextStyle = 
		{
			fontSize: '32px',
			color: '#FF0000',
			fontFamily: 'Arial'
		}

		let style: Phaser.Types.GameObjects.Text.TextStyle = 
		{
			fontSize: '32px',
			color: '#000000',
			fontFamily: 'Arial'
		}


		let blueTeamAverage: number = 0;
		let redTeamAverage: number = 0;

		this.TeamBlue_Back_newElo = this.game_type === GameType.Singles ? 
									this.game.registry.get('players_data').TeamBlue_Back.user.singles_elo
									: this.game.registry.get('players_data').TeamBlue_Back.user.doubles_elo;

		this.TeamRed_Back_newElo =	this.game_type === GameType.Singles ? 
									this.game.registry.get('players_data').TeamRed_Back.user.singles_elo
									: this.game.registry.get('players_data').TeamRed_Back.user.doubles_elo;

		blueTeamAverage += this.TeamBlue_Back_newElo;
		redTeamAverage += this.TeamRed_Back_newElo;

		if (this.game_type === GameType.Doubles)
		{
			this.TeamBlue_Front_newElo = this.game.registry.get('players_data').TeamBlue_Front.user.doubles_elo;
			this.TeamRed_Front_newElo = this.game.registry.get('players_data').TeamRed_Front.user.doubles_elo;

			blueTeamAverage += this.TeamBlue_Front_newElo;
			redTeamAverage += this.TeamRed_Front_newElo;
			
			blueTeamAverage /= 2;
			redTeamAverage /= 2;
		}

		const blueEloWon: number = Math.round(50 / (1 + Math.pow(10, (blueTeamAverage - redTeamAverage) / 400)));
		const blueEloLost: number = blueEloWon - 50;
		const redEloWon: number = Math.abs(blueEloLost);
		const redEloLost: number = redEloWon - 50;
		
		if (this.winner === EndResult.TeamBlue_Win)
		{
			this.TeamBlue_Back_newElo += blueEloWon;
			this.TeamBlue_Front_newElo += blueEloWon;
			this.TeamRed_Front_newElo += redEloLost;
			this.TeamRed_Back_newElo += redEloLost;

			this.add.text(100, 460, "+" + blueEloWon, style_green);
			this.add.text(700, 460, "" + redEloLost, style_red);
			if (this.game_type === GameType.Doubles)
			{
				this.add.text(300, 460, "+" + blueEloWon, style_green);
				this.add.text(500, 460, "" + redEloLost, style_red);
			}

		}
		else
		{
			this.TeamBlue_Back_newElo += blueEloLost;
			this.TeamBlue_Front_newElo += blueEloLost;
			this.TeamRed_Front_newElo += redEloWon;	
			this.TeamRed_Back_newElo += redEloWon;

			this.add.text(100, 460, "" + blueEloLost, style_red);
			this.add.text(700, 460, "+" + redEloWon, style_green);
			if (this.game_type === GameType.Doubles)
			{
				this.add.text(300, 460, "" + blueEloLost, style_red);
				this.add.text(500, 460, "+" + redEloWon, style_green);
			}

		}



		this.add.text(100, 420, "" + this.TeamBlue_Back_newElo, style);
		this.add.text(700, 420, "" + this.TeamRed_Back_newElo, style);

		// this.add.text(100, 460, "" + this.TeamBlue_Back_newElo, style);
		// this.add.text(700, 460, "" + this.TeamRed_Back_newElo, style);

		if (this.game_type === GameType.Doubles)
		{
			this.add.text(300, 420, "" + this.TeamBlue_Front_newElo, style);
			this.add.text(500, 420, "" + this.TeamRed_Front_newElo, style);
		}
	


	}



}
