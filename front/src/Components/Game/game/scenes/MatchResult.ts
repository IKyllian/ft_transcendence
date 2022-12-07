import 'phaser';
import { EndResult, GameType, PlayerType } from '../types/shared.types';
import { check_rank_change } from '../elo_tools';
import { elo_to_rank_as_string } from '../elo_tools';
import {  await_load_base64, loadAvatar } from '../texture_loader';

import AssetButton from '../../../../Assets/images/button.png';

import AssetRankUP from '../../../../Assets/images/green_arrow.png';
import AssetRankDOWN from '../../../../Assets/images/red_arrow.png';

import AssetRankSilver from '../../../../Images-Icons/Ranks/silver.png'
import AssetRankGold from '../../../../Images-Icons/Ranks/gold.png';
import AssetRankPlatine from '../../../../Images-Icons/Ranks/platine.png';
import AssetRankDiamond from '../../../../Images-Icons/Ranks/diamond.png';
import AssetRankChampion from '../../../../Images-Icons/Ranks/champion.png';
import AssetRankLegend from '../../../../Images-Icons/Ranks/legend.png';



export default class MatchResult extends Phaser.Scene
{
	constructor ()
	{
		super({ key: 'MatchResult' });
	}

	winner: EndResult = EndResult.Undecided;
	me: PlayerType = PlayerType.Spectator;
	game_type: GameType = GameType.Singles;

	TeamBlue_Back_avatar?: Phaser.GameObjects.Image;
	TeamBlue_Back_rank?: Phaser.GameObjects.Image;
	TeamBlue_Back_name?: Phaser.GameObjects.Text;
	TeamBlue_Back_elo?: Phaser.GameObjects.Text;

	TeamBlue_Front_avatar?: Phaser.GameObjects.Image;
	TeamBlue_Front_rank?: Phaser.GameObjects.Image;
	TeamBlue_Front_name?: Phaser.GameObjects.Text;
	TeamBlue_Front_elo?: Phaser.GameObjects.Text;

	TeamRed_Front_avatar?: Phaser.GameObjects.Image;
	TeamRed_Front_rank?: Phaser.GameObjects.Image;
	TeamRed_Front_name?: Phaser.GameObjects.Text;
	TeamRed_Front_elo?: Phaser.GameObjects.Text;

	TeamRed_Back_avatar?: Phaser.GameObjects.Image;
	TeamRed_Back_rank?: Phaser.GameObjects.Image;
	TeamRed_Back_name?: Phaser.GameObjects.Text;
	TeamRed_Back_elo?: Phaser.GameObjects.Text;

	TeamBlue_Back_oldElo: number = 0;
	TeamBlue_Front_oldElo: number = 0;
	TeamRed_Front_oldElo: number = 0;
	TeamRed_Back_oldElo: number = 0;

	TeamBlue_Back_newElo: number = 0;
	TeamBlue_Front_newElo: number = 0;
	TeamRed_Front_newElo: number = 0;
	TeamRed_Back_newElo: number = 0;

	result_text?: Phaser.GameObjects.Text;
	close_button?: Phaser.GameObjects.Image;

	preload ()
	{
		// loadAvatar(
		// 	this.game.registry.get('players_data').TeamBlue_Back.user,
		// 	'TeamBlue_back_avatar',
		// 	this.registry.get('token'),
		// 	this.registry.get('cache'),
		// 	this);

		// loadAvatar(
		// 	this.game.registry.get('players_data').TeamRed_Back.user,
		// 	'TeamRed_back_avatar',
		// 	this.registry.get('token'),
		// 	this.registry.get('cache'),
		// 	 this);

		this.game_type = this.game.registry.get('players_data').game_settings.game_type;

		// if (this.game_type === GameType.Doubles)
		// {
		// 	loadAvatar(
		// 		this.game.registry.get('players_data').TeamBlue_Front.user,
		// 		'TeamBlue_front_avatar',
		// 		this.registry.get('token'),
		// 		this.registry.get('cache'),
		// 		 this);
		// 	loadAvatar(
		// 		this.game.registry.get('players_data').TeamBlue_Front.user,
		// 		'TeamBlue_front_avatar',this.registry.get('token'),
		// 		this.registry.get('cache'),
		// 		 this);
		// }

		// await_load_base64(AssetRankSilver, "Silver", this);
		// await_load_base64(AssetRankGold, "Gold", this);
		// await_load_base64(AssetRankPlatine, "Platine", this);
		// await_load_base64(AssetRankDiamond, "Diamond", this);
		// await_load_base64(AssetRankChampion, "Champion", this);
		// await_load_base64(AssetRankLegend, "Legend", this);

		// await_load_base64(AssetRankUP, "rank_UP", this);
		// await_load_base64(AssetRankDOWN, "rank_DOWN", this);

		this.load.image("rank_UP", AssetRankUP);
		this.load.image("rank_DOWN", AssetRankDOWN);

		this.scene.remove('Pong');
	}

	create ()
	{
		this.me = this.game.registry.get('players_data').player_type;
		this.winner = this.game.registry.get('winner');

		// this.TeamBlue_Back_name = this.game.registry.get('players_data').TeamBlue_Back.name;
		// this.TeamRed_Back_name = this.game.registry.get('players_data').TeamRed_Back.name;
	
		let style: Phaser.Types.GameObjects.Text.TextStyle = 
		{
			fontSize: '32px',
			color: '#000000',
			fontFamily: 'Arial'
		}

		this.TeamBlue_Back_name = this.add.text(100, 360, "" +
								this.game.registry.get('players_data').TeamBlue_Back.user.username, style);
		this.TeamRed_Back_name = this.add.text(700, 360, "" +
								this.game.registry.get('players_data').TeamRed_Back.user.username, style);



		this.TeamBlue_Back_avatar = this.add.image(130, 130, 'TeamBlue_back_avatar')
								.setOrigin(0.5,0.5)
								.setDisplaySize(150, 150);
		this.TeamRed_Back_avatar = this.add.image(670, 130, 'TeamRed_back_avatar')
								.setOrigin(0.5,0.5)
								.setDisplaySize(150, 150);
		if (this.game_type === GameType.Doubles)
		{
			this.TeamBlue_Front_name = this.add.text(300, 360, "" +
					this.game.registry.get('players_data').TeamBlue_Front.user.username, style);
			this.TeamRed_Front_name = this.add.text(500, 360, "" +
					this.game.registry.get('players_data').TeamRed_Front.user.username, style);
			this.TeamBlue_Front_avatar = this.add.image(280, 130, 'TeamBlue_front_avatar')
								.setOrigin(0.5,0.5)
								.setDisplaySize(150, 150);
			this.TeamRed_Front_avatar = this.add.image(520, 130, 'TeamRed_front_avatar')
								.setOrigin(0.5,0.5)
								.setDisplaySize(150, 150);
		}

		this.close_button = this.add.image(400, 400, 'button')
								.setOrigin(0.5,0.5)
								.setDisplaySize(200, 200)
								.setName('close')
								.setInteractive();

		let text: string;

		if(this.game_type === GameType.Singles)
		{
			if(this.me === PlayerType.Spectator)
			{
				if (this.winner === EndResult.TeamBlue_Win)
				{
					text = this.game.registry.get('players_data').TeamBlue_Back.user.username + " Wins";
				}
				else
				{
					text = this.game.registry.get('players_data').TeamRed_Back.user.username + " Wins";
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
					text = "Team"
						+ this.game.registry.get('players_data').TeamBlue_Back.user.username
						+ " and " + this.game.registry.get('players_data').TeamBlue_Front.user.username
						+ " Wins";
				}
				else
				{
					text = "Team"
					+ this.game.registry.get('players_data').TeamRed_Back.user.username
					+ " and " + this.game.registry.get('players_data').TeamRed_Front.user.username
					+ " Wins";
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


		if (this.game.registry.get('players_data').game_settings.is_ranked)
		{
			this.eloDisplay();
		}

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

		this.TeamBlue_Back_oldElo = this.game_type === GameType.Singles ? 
									this.game.registry.get('players_data').TeamBlue_Back.user.singles_elo
									: this.game.registry.get('players_data').TeamBlue_Back.user.doubles_elo;

		this.TeamRed_Back_oldElo =	this.game_type === GameType.Singles ? 
									this.game.registry.get('players_data').TeamRed_Back.user.singles_elo
									: this.game.registry.get('players_data').TeamRed_Back.user.doubles_elo;

		blueTeamAverage += this.TeamBlue_Back_oldElo;
		redTeamAverage += this.TeamRed_Back_oldElo;


		if (this.game_type === GameType.Doubles)
		{
			this.TeamBlue_Front_oldElo = this.game.registry.get('players_data').TeamBlue_Front.user.doubles_elo;
			this.TeamRed_Front_oldElo = this.game.registry.get('players_data').TeamRed_Front.user.doubles_elo;

			blueTeamAverage += this.TeamBlue_Front_oldElo;
			redTeamAverage += this.TeamRed_Front_oldElo;
			
			blueTeamAverage /= 2;
			redTeamAverage /= 2;
		}

		const blueEloWon: number = Math.round(50 / (1 + Math.pow(10, (blueTeamAverage - redTeamAverage) / 400)));
		const blueEloLost: number = blueEloWon - 50;
		const redEloWon: number = Math.abs(blueEloLost);
		const redEloLost: number = redEloWon - 50;
		
		if (this.winner === EndResult.TeamBlue_Win)
		{
			this.TeamBlue_Back_newElo += this.TeamBlue_Back_oldElo + blueEloWon;
			this.TeamBlue_Front_newElo += this.TeamBlue_Front_oldElo + blueEloWon;
			this.TeamRed_Front_newElo += this.TeamRed_Front_oldElo + redEloLost;
			this.TeamRed_Back_newElo += this.TeamRed_Back_oldElo + redEloLost;

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
			this.TeamBlue_Back_newElo += this.TeamBlue_Back_oldElo + blueEloLost;
			this.TeamBlue_Front_newElo += this.TeamBlue_Front_oldElo + blueEloLost;
			this.TeamRed_Front_newElo += this.TeamRed_Front_oldElo + redEloWon;	
			this.TeamRed_Back_newElo += this.TeamRed_Back_oldElo + redEloWon;

			this.add.text(100, 460, "" + blueEloLost, style_red);
			this.add.text(700, 460, "+" + redEloWon, style_green);
			if (this.game_type === GameType.Doubles)
			{
				this.add.text(300, 460, "" + blueEloLost, style_red);
				this.add.text(500, 460, "+" + redEloWon, style_green);
			}

		}

		if (check_rank_change(
			this.TeamBlue_Back_oldElo,
			this.TeamBlue_Back_newElo))
		{
			if (this.TeamBlue_Back_newElo > this.TeamBlue_Back_oldElo)
			{
				this.add.image(130, 130, 'rank_UP')
								.setOrigin(0.5,0.5)
								.setDisplaySize(50, 50);
			}
			else
			{
				this.add.image(130, 130, 'rank_DOWN')
								.setOrigin(0.5,0.5)
								.setDisplaySize(50, 50);
			}
		}



		if (check_rank_change(
			this.TeamRed_Back_oldElo,
			this.TeamRed_Back_newElo))
		{
			if (this.TeamRed_Back_newElo > this.TeamRed_Back_oldElo)
			{
				this.add.image(670, 130, 'rank_UP')
								.setOrigin(0.5,0.5)
								.setDisplaySize(50, 50);
			}
			else
			{
				this.add.image(670, 130, 'rank_DOWN')
								.setOrigin(0.5,0.5)
								.setDisplaySize(50, 50);
			}
		}

		if (this.game_type === GameType.Doubles)
		{
			if (check_rank_change(
				this.TeamBlue_Front_oldElo,
				this.TeamBlue_Front_newElo))
			{
				if (this.TeamBlue_Front_newElo > this.TeamBlue_Front_oldElo)
				{
					this.add.image(280, 130, 'rank_UP')
									.setOrigin(0.5,0.5)
									.setDisplaySize(50, 50);
				}
				else
				{
					this.add.image(280, 130, 'rank_DOWN')
									.setOrigin(0.5,0.5)
									.setDisplaySize(50, 50);
				}
			}
	
	
	
			if (check_rank_change(
				this.TeamRed_Front_oldElo,
				this.TeamRed_Front_newElo))
			{
				if (this.TeamRed_Front_newElo > this.TeamRed_Front_oldElo)
				{
					this.add.image(520, 130, 'rank_UP')
									.setOrigin(0.5,0.5)
									.setDisplaySize(50, 50);
				}
				else
				{
					this.add.image(520, 130, 'rank_DOWN')
									.setOrigin(0.5,0.5)
									.setDisplaySize(50, 50);
				}
			}


		}

		this.add.text(100, 420, "" + this.TeamBlue_Back_newElo, style);
		this.add.text(700, 420, "" + this.TeamRed_Back_newElo, style);

		if (this.game_type === GameType.Doubles)
		{
			this.add.text(300, 420, "" + this.TeamBlue_Front_newElo, style);
			this.add.text(500, 420, "" + this.TeamRed_Front_newElo, style);
		}
	


	}



}
