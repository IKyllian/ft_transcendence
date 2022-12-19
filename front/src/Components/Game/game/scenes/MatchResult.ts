import 'phaser';
import { EndResult, GameType, PlayerType } from '../types/shared.types';
import { check_rank_change } from '../elo_tools';
import { elo_to_rank_as_string } from '../elo_tools';
import {  await_load_base64, loadAvatar } from '../texture_loader';
import { make_style } from '../text_tools';
import { shorten_nickname } from '../text_tools';
import AssetButton from '../../../../Assets/images/button.png';

import AssetRankUP from '../../../../Assets/images/green_arrow.png';
import AssetRankDOWN from '../../../../Assets/images/red_arrow.png';

export default class MatchResult extends Phaser.Scene
{
	constructor ()
	{
		super({ key: 'MatchResult' });
	}

	winner: EndResult = EndResult.Undecided;
	me: PlayerType = PlayerType.Spectator;
	game_type: GameType = GameType.Singles;


	TeamBlue_Back_elo?: Phaser.GameObjects.Text;
	TeamBlue_Back_interval: any;
	TeamBlue_Back_elo_change?: Phaser.GameObjects.Text;
	TeamBlue_Back_change_interval: any;

	TeamRed_Back_elo?: Phaser.GameObjects.Text;
	TeamRed_Back_interval: any;
	TeamRed_Back_elo_change?: Phaser.GameObjects.Text;
	TeamRed_Back_change_interval: any;
	// TeamRed_Back_elo_change?: Phaser.GameObjects.Text;

	TeamBlue_Front_elo?: Phaser.GameObjects.Text;
	TeamBlue_Front_interval: any;
	TeamBlue_Front_elo_change?: Phaser.GameObjects.Text;
	TeamBlue_Front_change_interval: any;
	// TeamBlue_Front_elo_change?: Phaser.GameObjects.Text;

	TeamRed_Front_elo?: Phaser.GameObjects.Text;
	TeamRed_Front_interval: any;
	TeamRed_Front_elo_change?: Phaser.GameObjects.Text;
	TeamRed_Front_change_interval: any;
	// TeamRed_Front_elo_change?: Phaser.GameObjects.Text;



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
		this.scene.remove('Pong');
		this.game_type = this.game.registry.get('players_data').game_settings.game_type;
		this.load.image("rank_UP", AssetRankUP);
		this.load.image("rank_DOWN", AssetRankDOWN);
	}

	create ()
	{
		this.cameras.main.setBackgroundColor("#415A77");
		this.me = this.game.registry.get('players_data').player_type;
		this.winner = this.game.registry.get('winner');

		// this.TeamBlue_Back_name = this.add.text(100, 360, "" +
		// 						this.game.registry.get('players_data').TeamBlue_Back.user.username, make_style(26));
		// this.TeamRed_Back_name = this.add.text(700, 360, "" +
		// 						this.game.registry.get('players_data').TeamRed_Back.user.username, make_style(26));

		this.add.image(100, 130,
				'TeamBlue_back_avatar')
				.setOrigin(0.5,0.5)
				.setDisplaySize(175, 175);
		this.add.image(700, 130,
				'TeamRed_back_avatar')
				.setOrigin(0.5,0.5)
				.setDisplaySize(175, 175);

		this.add.text(100, 290,
					shorten_nickname(this.game.registry.get('players_data').TeamBlue_Back.user.username),
					make_style(32))
					.setOrigin(0.5,0.5);
		this.add.text(700, 290,
					shorten_nickname(this.game.registry.get('players_data').TeamRed_Back.user.username),
					make_style(32))
					.setOrigin(0.5,0.5);

		if (this.game_type === GameType.Doubles)
		{
			this.add.image(285, 130, 'TeamBlue_front_avatar')
						.setOrigin(0.5,0.5)
						.setDisplaySize(175, 175);
			this.add.text(285, 290,
						shorten_nickname(this.game.registry.get('players_data').TeamBlue_Front.user.username),
						make_style(32))
						.setOrigin(0.5,0.5);


			this.add.image(515, 130, 'TeamRed_front_avatar')
						.setOrigin(0.5,0.5)
						.setDisplaySize(175, 175);
			this.add.text(515, 290,
						shorten_nickname(this.game.registry.get('players_data').TeamRed_Front.user.username),
						make_style(32))
						.setOrigin(0.5,0.5);	
		}

		let text: string;
		let color: string = "#E0E1DD";

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
				text = "Victory";
				color = "#00FF00";
			}
			else
			{
				text = "Defeat";
				color = "#FF0000";
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
				text = "Victory";
				color = "#00FF00";
			}
			else
			{
				text = "Defeat";
				color = "#FF0000";
			}		
		}


		if (this.game.registry.get('players_data').game_settings.is_ranked)
		{
			this.eloDisplay();
			this.rankDisplay();
		}

		this.result_text = this.add.text(400, 240, text, make_style(40, color)).setOrigin(0.5, 0.5);
		this.input.on('gameobjectdown',this.click_event);

		setTimeout(() => {
			this.game.registry.get('setHasEnded')(true);
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
			this.game.registry.get('setHasEnded')(true);
			this.game.destroy(true, false);
		}
	}

	eloDisplay = () =>
	{
		let style_green: Phaser.Types.GameObjects.Text.TextStyle = 
		{
			fontSize: '28px',
			color: '#00FF00',
			fontFamily: 'Silkscreen'
		}

		let style_red: Phaser.Types.GameObjects.Text.TextStyle = 
		{
			fontSize: '28px',
			color: '#FF0000',
			fontFamily: 'Silkscreen'
		}

		let style: Phaser.Types.GameObjects.Text.TextStyle = 
		{
			fontSize: '32px',
			color: '#000000',
			fontFamily: 'Silkscreen'
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
	
		
/////////////////////

		this.TeamBlue_Back_elo = this.add.text(100, 380, "", style).setOrigin(0.5,0.5);
		this.TeamBlue_Front_elo = this.add.text(285, 380, "", style).setOrigin(0.5,0.5);
		this.TeamRed_Front_elo = this.add.text(515, 380, "", style).setOrigin(0.5,0.5);
		this.TeamRed_Back_elo = this.add.text(700, 380, "", style).setOrigin(0.5,0.5);


		if (this.winner === EndResult.TeamBlue_Win)
		{
			this.TeamBlue_Back_newElo += this.TeamBlue_Back_oldElo + blueEloWon;
			this.TeamBlue_Front_newElo += this.TeamBlue_Front_oldElo + blueEloWon;
			this.TeamRed_Front_newElo += this.TeamRed_Front_oldElo + redEloLost;
			this.TeamRed_Back_newElo += this.TeamRed_Back_oldElo + redEloLost;

			this.TeamBlue_Back_elo_change = this.add.text(100, 340, "", style_green)
								.setOrigin(0.5,0.5);
			this.TeamRed_Back_elo_change = this.add.text(700, 340, "", style_red)
								.setOrigin(0.5,0.5);


			let display_tmp: number = blueEloWon;

			clearInterval(this.TeamBlue_Back_change_interval);
			this.TeamBlue_Back_change_interval = setInterval(
				(function(self) { return function()
				{
					self.TeamBlue_Back_elo_change?.setText("+" + display_tmp);
					display_tmp--;
					if (display_tmp <= 0)
					{
						self.TeamBlue_Back_elo_change?.destroy();
						clearInterval(self.TeamBlue_Back_change_interval);
					}
				}; })(this),
				60);

			
			display_tmp = redEloLost;
			clearInterval(this.TeamRed_Back_change_interval);
			this.TeamRed_Back_change_interval = setInterval(
				(function(self) { return function()
				{
					self.TeamRed_Back_elo_change?.setText("" + display_tmp);
					display_tmp++;
					if (display_tmp >= 0)
					{
						self.TeamRed_Back_elo_change?.destroy();
						clearInterval(self.TeamRed_Back_change_interval);
					}
				}; })(this),
				60);


			clearInterval(this.TeamBlue_Back_interval);
			this.TeamBlue_Back_interval = setInterval(
				(function(self) { return function()
				{
					self.TeamBlue_Back_elo?.setText("" + self.TeamBlue_Back_oldElo);
					self.TeamBlue_Back_oldElo++;
					if (self.TeamBlue_Back_oldElo === self.TeamBlue_Back_newElo)
						clearInterval(self.TeamBlue_Back_interval);
				}; })(this),
				60);
						

			clearInterval(this.TeamRed_Back_interval);
			this.TeamRed_Back_interval = setInterval(
				(function(self) { return function()
				{
					self.TeamRed_Back_elo?.setText("" + self.TeamRed_Back_oldElo);
					self.TeamRed_Back_oldElo--;
					if (self.TeamRed_Back_oldElo === self.TeamRed_Back_newElo)
						clearInterval(self.TeamRed_Back_interval);
				}; })(this),
				60);




			if (this.game_type === GameType.Doubles)
			{
				this.TeamBlue_Front_elo_change = this.add.text(285, 340, "", style_green)
								.setOrigin(0.5,0.5);
				this.TeamRed_Front_elo_change = this.add.text(515, 340, "", style_red)
								.setOrigin(0.5,0.5);

				display_tmp = blueEloWon;
				clearInterval(this.TeamBlue_Front_change_interval);
				this.TeamBlue_Front_change_interval = setInterval(
					(function(self) { return function()
					{
						self.TeamBlue_Front_elo_change?.setText("+" + display_tmp);
						display_tmp--;
						if (display_tmp <= 0)
						{
							self.TeamBlue_Front_elo_change?.destroy();
							clearInterval(self.TeamBlue_Front_change_interval);
						}
					}; })(this),
					60);
	
				
				display_tmp = redEloLost;
				clearInterval(this.TeamRed_Front_change_interval);
				this.TeamRed_Front_change_interval = setInterval(
					(function(self) { return function()
					{
						self.TeamRed_Front_elo_change?.setText("" + display_tmp);
						display_tmp++;
						if (display_tmp >= 0)
						{
							self.TeamRed_Front_elo_change?.destroy();
							clearInterval(self.TeamRed_Front_change_interval);
						}
					}; })(this),
					60);







				clearInterval(this.TeamBlue_Front_interval);
				this.TeamBlue_Front_interval = setInterval(
					(function(self) { return function()
					{
						self.TeamBlue_Front_elo?.setText("" + self.TeamBlue_Front_oldElo);
						self.TeamBlue_Front_oldElo++;
						if (self.TeamBlue_Front_oldElo === self.TeamBlue_Front_newElo)
						clearInterval(self.TeamBlue_Front_interval);
					}; })(this),
					60);
			
					
				clearInterval(this.TeamRed_Front_interval);
				this.TeamRed_Front_interval = setInterval(
					(function(self) { return function()
					{
						self.TeamRed_Front_elo?.setText("" + self.TeamRed_Front_oldElo);
						self.TeamRed_Front_oldElo--;
						if (self.TeamRed_Front_oldElo === self.TeamRed_Front_newElo)
						clearInterval(self.TeamRed_Front_interval);
					}; })(this),
					60);

			}

		}
		else
		{
			this.TeamBlue_Back_newElo += this.TeamBlue_Back_oldElo + blueEloLost;
			this.TeamBlue_Front_newElo += this.TeamBlue_Front_oldElo + blueEloLost;
			this.TeamRed_Front_newElo += this.TeamRed_Front_oldElo + redEloWon;	
			this.TeamRed_Back_newElo += this.TeamRed_Back_oldElo + redEloWon;

			this.TeamBlue_Back_elo_change = this.add.text(100, 340, "" , style_red).setOrigin(0.5,0.5);
			this.TeamRed_Back_elo_change = this.add.text(700, 340, "", style_green).setOrigin(0.5,0.5);




			let display_tmp: number = blueEloLost;

			clearInterval(this.TeamBlue_Back_change_interval);
			this.TeamBlue_Back_change_interval = setInterval(
				(function(self) { return function()
				{
					self.TeamBlue_Back_elo_change?.setText("-" + display_tmp);
					display_tmp++;
					if (display_tmp >= 0)
					{
						self.TeamBlue_Back_elo_change?.destroy();
						clearInterval(self.TeamBlue_Back_change_interval);
					}
				}; })(this),
				60);

			
			display_tmp = redEloWon;
			clearInterval(this.TeamRed_Back_change_interval);
			this.TeamRed_Back_change_interval = setInterval(
				(function(self) { return function()
				{
					self.TeamRed_Back_elo_change?.setText("" + display_tmp);
					display_tmp--;
					if (display_tmp <= 0)
					{
						self.TeamRed_Back_elo_change?.destroy();
						clearInterval(self.TeamRed_Back_change_interval);
					}
				}; })(this),
				60);





			clearInterval(this.TeamBlue_Back_interval);
			this.TeamBlue_Back_interval = setInterval(
				(function(self) { return function()
				{
					self.TeamBlue_Back_elo?.setText("" + self.TeamBlue_Back_oldElo);
					self.TeamBlue_Back_oldElo--;
					if (self.TeamBlue_Back_oldElo === self.TeamBlue_Back_newElo)
					clearInterval(self.TeamBlue_Back_interval);
				}; })(this),
				60);
						

			clearInterval(this.TeamRed_Back_interval);
			this.TeamRed_Back_interval = setInterval(
				(function(self) { return function()
				{
					self.TeamRed_Back_elo?.setText("" + self.TeamRed_Back_oldElo);
					self.TeamRed_Back_oldElo++;
					if (self.TeamRed_Back_oldElo === self.TeamRed_Back_newElo)
					clearInterval(self.TeamRed_Back_interval);
				}; })(this),
				60);
	

			if (this.game_type === GameType.Doubles)
			{
				this.TeamBlue_Front_elo_change = this.add.text(285, 340, "", style_red).setOrigin(0.5,0.5);
				this.TeamRed_Front_elo_change = this.add.text(515, 340, "", style_green).setOrigin(0.5,0.5);




				let display_tmp: number = blueEloLost;

				clearInterval(this.TeamBlue_Front_change_interval);
				this.TeamBlue_Front_change_interval = setInterval(
					(function(self) { return function()
					{
						self.TeamBlue_Front_elo_change?.setText("" + display_tmp);
						display_tmp++;
						if (display_tmp >= 0)
						{
							self.TeamBlue_Front_elo_change?.destroy();
							clearInterval(self.TeamBlue_Front_change_interval);
						}
					}; })(this),
					60);
	
				
				display_tmp = redEloWon;
				clearInterval(this.TeamRed_Front_change_interval);
				this.TeamRed_Front_change_interval = setInterval(
					(function(self) { return function()
					{
						self.TeamRed_Front_elo_change?.setText("+" + display_tmp);
						display_tmp--;
						if (display_tmp <= 0)
						{
							self.TeamRed_Front_elo_change?.destroy();
							clearInterval(self.TeamRed_Front_change_interval);
						}
					}; })(this),
					60);






				clearInterval(this.TeamBlue_Front_interval);
				this.TeamBlue_Front_interval = setInterval(
					(function(self) { return function()
					{
						self.TeamBlue_Front_elo?.setText("" + self.TeamBlue_Front_oldElo);
						self.TeamBlue_Front_oldElo--;
						if (self.TeamBlue_Front_oldElo === self.TeamBlue_Front_newElo)
						clearInterval(self.TeamBlue_Front_interval);
					}; })(this),
					60);
			
					
				clearInterval(this.TeamRed_Front_interval);
				this.TeamRed_Front_interval = setInterval(
					(function(self) { return function()
					{
						self.TeamRed_Front_elo?.setText("" + self.TeamRed_Front_oldElo);
						self.TeamRed_Front_oldElo++;
						if (self.TeamRed_Front_oldElo === self.TeamRed_Front_newElo)
						clearInterval(self.TeamRed_Front_interval);
					}; })(this),
					60);


			}

		}





	}

	rankDisplay = () =>
	{

		let style_arrow_green: Phaser.Types.GameObjects.Text.TextStyle = 
		{
			fontSize: '34px',
			color: '#00FF00',
			fontFamily: 'Arial'
		}

		let style_arrow_red: Phaser.Types.GameObjects.Text.TextStyle = 
		{
			fontSize: '34px',
			color: '#FF0000',
			fontFamily: 'Arial'
		}

		if (check_rank_change(
			this.TeamBlue_Back_oldElo,
			this.TeamBlue_Back_newElo))
		{

			this.add.image(60, 450,
				elo_to_rank_as_string(this.TeamBlue_Back_oldElo))
				.setOrigin(0.5,0.5)
				.setDisplaySize(100, 100);


			this.add.image(130, 450,
				elo_to_rank_as_string(this.TeamBlue_Back_newElo))
				.setOrigin(0.5,0.5)
				.setDisplaySize(100, 100);

			if (this.TeamBlue_Back_newElo > this.TeamBlue_Back_oldElo)
			{
				this.add.text(100, 450, "➜", style_arrow_green).setOrigin(0.5,0.5);
			}
			else
			{
				this.add.text(100, 450, "➜", style_arrow_red).setOrigin(0.5,0.5);
			}
		}
		else
		{
			this.add.image(100, 450,
				elo_to_rank_as_string(this.TeamBlue_Back_newElo))
				.setOrigin(0.5,0.5)
				.setDisplaySize(100, 100);
		}


//⬈
//this.add.text(285, 380, "" + this.TeamBlue_Front_newElo, style).setOrigin(0.5,0.5);

		if (check_rank_change(
			this.TeamRed_Back_oldElo,
			this.TeamRed_Back_newElo))
		{

			//rank changed, display old left, new right, arrow (colored) middle
			this.add.image(660, 450,
				elo_to_rank_as_string(this.TeamRed_Back_oldElo))
				.setOrigin(0.5,0.5)
				.setDisplaySize(100, 100);


			this.add.image(730, 450,
				elo_to_rank_as_string(this.TeamRed_Back_newElo))
				.setOrigin(0.5,0.5)
				.setDisplaySize(100, 100);

			if (this.TeamRed_Back_newElo > this.TeamRed_Back_oldElo)
			{
				this.add.text(700, 450, "➜", style_arrow_green).setOrigin(0.5,0.5);
			}
			else
			{
				this.add.text(700, 450, "➜", style_arrow_red).setOrigin(0.5,0.5);
			}
		}
		else
		{
			//rank unchanged, display rank
			this.add.image(700, 450,
				elo_to_rank_as_string(this.TeamRed_Back_newElo))
				.setOrigin(0.5,0.5)
				.setDisplaySize(100, 100);
		}









		if (this.game_type === GameType.Doubles)
		{
			if (check_rank_change(
				this.TeamBlue_Front_oldElo,
				this.TeamBlue_Front_newElo))
			{

				this.add.image(245, 450,
					elo_to_rank_as_string(this.TeamBlue_Front_oldElo))
					.setOrigin(0.5,0.5)
					.setDisplaySize(100, 100);
	
	
				this.add.image(315, 450,
					elo_to_rank_as_string(this.TeamBlue_Front_newElo))
					.setOrigin(0.5,0.5)
					.setDisplaySize(100, 100);

				if (this.TeamBlue_Front_newElo > this.TeamBlue_Front_oldElo)
				{
					this.add.text(285, 450, "➜", style_arrow_green).setOrigin(0.5,0.5);
				}
				else
				{
					this.add.text(285, 450, "➜", style_arrow_red).setOrigin(0.5,0.5);
				}
			}
			else
			{
				//rank unchanged, display rank
				this.add.image(285, 450,
					elo_to_rank_as_string(this.TeamBlue_Front_newElo))
					.setOrigin(0.5,0.5)
					.setDisplaySize(100, 100);
			}
	
	
			if (check_rank_change(
				this.TeamRed_Front_oldElo,
				this.TeamRed_Front_newElo))
			{

				this.add.image(475, 450,
					elo_to_rank_as_string(this.TeamRed_Front_oldElo))
					.setOrigin(0.5,0.5)
					.setDisplaySize(100, 100);
	
	
				this.add.image(545, 450,
					elo_to_rank_as_string(this.TeamRed_Front_newElo))
					.setOrigin(0.5,0.5)
					.setDisplaySize(100, 100);

				if (this.TeamRed_Front_newElo > this.TeamRed_Front_oldElo)
				{
					this.add.text(515, 450, "➜", style_arrow_green).setOrigin(0.5,0.5);
				}
				else
				{
					this.add.text(515, 450, "➜", style_arrow_red).setOrigin(0.5,0.5);
				}
			}
			else
			{
				//rank unchanged, display rank
				this.add.image(285, 450,
					elo_to_rank_as_string(this.TeamRed_Front_newElo))
					.setOrigin(0.5,0.5)
					.setDisplaySize(100, 100);
			}


		}





	}


}
