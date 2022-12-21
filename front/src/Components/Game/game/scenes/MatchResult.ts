import 'phaser';
import { EndResult, GameType, PlayerType } from '../types/shared.types';
import { check_rank_change } from '../utils/elo_tools';
import { elo_to_rank_as_string } from '../utils/elo_tools';
import { make_style } from '../utils/text_tools';
import { shorten_nickname } from '../utils/text_tools';

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
	TeamBlue_Back_elo_change?: Phaser.GameObjects.Text;

	TeamRed_Back_elo?: Phaser.GameObjects.Text;
	TeamRed_Back_elo_change?: Phaser.GameObjects.Text;

	TeamBlue_Front_elo?: Phaser.GameObjects.Text;
	TeamBlue_Front_elo_change?: Phaser.GameObjects.Text;

	TeamRed_Front_elo?: Phaser.GameObjects.Text;
	TeamRed_Front_elo_change?: Phaser.GameObjects.Text;

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
	}

	create ()
	{
		this.cameras.main.setBackgroundColor("#415A77");
		this.me = this.game.registry.get('players_data').player_type;
		this.winner = this.game.registry.get('winner');

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
					text = "Team "
						+ this.game.registry.get('players_data').TeamBlue_Back.user.username
						+ " and " + this.game.registry.get('players_data').TeamBlue_Front.user.username
						+ " Wins";
						color = "#0059FF";
				}
				else
				{
					text = "Team "
					+ this.game.registry.get('players_data').TeamRed_Back.user.username
					+ " and " + this.game.registry.get('players_data').TeamRed_Front.user.username
					+ " Wins";
					color = "#F91900";
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

		this.TeamBlue_Back_elo = this.add.text(100, 380, "" + this.TeamBlue_Back_oldElo,make_style(28,'#000000')).setOrigin(0.5,0.5);
		this.TeamBlue_Front_elo = this.add.text(285, 380, "" + this.TeamBlue_Front_oldElo,make_style(28,'#000000')).setOrigin(0.5,0.5);
		this.TeamRed_Front_elo = this.add.text(515, 380, "" + this.TeamRed_Front_oldElo,make_style(28,'#000000')).setOrigin(0.5,0.5);
		this.TeamRed_Back_elo = this.add.text(700, 380, "" + this.TeamRed_Back_oldElo,make_style(28,'#000000')).setOrigin(0.5,0.5);

		if (this.winner === EndResult.TeamBlue_Win)
		{
			this.TeamBlue_Back_newElo += this.TeamBlue_Back_oldElo + blueEloWon;
			this.TeamBlue_Front_newElo += this.TeamBlue_Front_oldElo + blueEloWon;
			this.TeamRed_Front_newElo += this.TeamRed_Front_oldElo + redEloLost;
			this.TeamRed_Back_newElo += this.TeamRed_Back_oldElo + redEloLost;

			this.TeamBlue_Back_elo_change = this.add.text(100, 340, "+" + blueEloWon, make_style(28, '#00FF00'))
								.setOrigin(0.5,0.5);
			this.TeamRed_Back_elo_change = this.add.text(700, 340, "" + redEloLost, make_style(28,'#FF0000'))
								.setOrigin(0.5,0.5);
					
			this.eloRollingCount(
				this.TeamBlue_Back_oldElo,
				blueEloWon,
				this.TeamBlue_Back_elo,
				this.TeamBlue_Back_elo_change
			);

			this.eloRollingCount(
				this.TeamRed_Back_oldElo,
				redEloLost,
				this.TeamRed_Back_elo,
				this.TeamRed_Back_elo_change
			);

			if (this.game_type === GameType.Doubles)
			{
				this.TeamBlue_Front_elo_change = this.add.text(285, 340, "+" + blueEloWon, make_style(28, '#00FF00'))
								.setOrigin(0.5,0.5);
				this.TeamRed_Front_elo_change = this.add.text(515, 340, "" + redEloLost, make_style(28, '#FF0000'))
								.setOrigin(0.5,0.5);

				this.eloRollingCount(
					this.TeamBlue_Front_oldElo,
					blueEloWon,
					this.TeamBlue_Front_elo,
					this.TeamBlue_Front_elo_change
				);

				this.eloRollingCount(
					this.TeamRed_Front_oldElo,
					redEloLost,
					this.TeamRed_Front_elo,
					this.TeamRed_Front_elo_change
				);
			}

		}
		else
		{
			this.TeamBlue_Back_newElo += this.TeamBlue_Back_oldElo + blueEloLost;
			this.TeamBlue_Front_newElo += this.TeamBlue_Front_oldElo + blueEloLost;
			this.TeamRed_Front_newElo += this.TeamRed_Front_oldElo + redEloWon;	
			this.TeamRed_Back_newElo += this.TeamRed_Back_oldElo + redEloWon;

			this.TeamBlue_Back_elo_change = this.add.text(100, 340, "" + blueEloLost , make_style(28,'#FF0000' )).setOrigin(0.5,0.5);
			this.TeamRed_Back_elo_change = this.add.text(700, 340, "+" + redEloWon, make_style(28,'#00FF00' )).setOrigin(0.5,0.5);


			this.eloRollingCount(
				this.TeamBlue_Back_oldElo,
				blueEloLost,
				this.TeamBlue_Back_elo,
				this.TeamBlue_Back_elo_change
			);

			this.eloRollingCount(
				this.TeamRed_Back_oldElo,
				redEloWon,
				this.TeamRed_Back_elo,
				this.TeamRed_Back_elo_change
			);

			if (this.game_type === GameType.Doubles)
			{
				this.TeamBlue_Front_elo_change = this.add.text(285, 340, "" + blueEloLost, make_style(28,'#FF0000' )).setOrigin(0.5,0.5);
				this.TeamRed_Front_elo_change = this.add.text(515, 340, "+" + redEloWon, make_style(28,'#00FF00' )).setOrigin(0.5,0.5);

				this.eloRollingCount(
					this.TeamBlue_Front_oldElo,
					blueEloLost,
					this.TeamBlue_Front_elo,
					this.TeamBlue_Front_elo_change
				);

				this.eloRollingCount(
					this.TeamRed_Front_oldElo,
					redEloWon,
					this.TeamRed_Front_elo,
					this.TeamRed_Front_elo_change
				);
			}
		}
	}

	rankDisplay = () =>
	{
		this.rankPrint(this.TeamBlue_Back_oldElo, this.TeamBlue_Back_newElo, 100);
		this.rankPrint(this.TeamRed_Back_oldElo, this.TeamRed_Back_newElo, 700);
		if (this.game_type === GameType.Doubles)
		{
			this.rankPrint(this.TeamBlue_Front_oldElo, this.TeamBlue_Front_newElo, 285);
			this.rankPrint(this.TeamRed_Front_oldElo, this.TeamRed_Front_newElo, 515);
		}
	}

	eloRollingCount = (
		old_elo: number,
		elo_change:number,
		target_elo: Phaser.GameObjects.Text,
		target_change: Phaser.GameObjects.Text
		) =>
	{
		let inter: any;

		if (elo_change > 0)
		{
			setTimeout( () => {
			
				clearInterval(inter);
				inter = setInterval(
					(function(self) { return function()
					{
						target_change.setText("+" + elo_change);
						target_elo.setText("" + old_elo);
						elo_change--;
						old_elo++;
						if (elo_change <= 0)
						{
							target_change.destroy();
							clearInterval(inter);
						}
					}; })(this),
					60);
				}, 2000);
		}
		else
		{
			setTimeout( () => {
			
				clearInterval(inter);
				inter = setInterval(
					(function(self) { return function()
					{
						target_change.setText("" + elo_change);
						target_elo.setText("" + old_elo);
						elo_change++;
						old_elo--;
						if (elo_change >= 0)
						{
							target_change.destroy();
							clearInterval(inter);
						}
					}; })(this),
					60);
				}, 2000);
		}
	}



	rankPrint = (
		old_elo: number,
		new_elo: number,
		x_pos: number
		) =>
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

		if (check_rank_change(old_elo,new_elo))
		{

			this.add.image(x_pos - 30, 450,
				elo_to_rank_as_string(old_elo))
				.setOrigin(0.5,0.5)
				.setDisplaySize(100, 100);


			this.add.image(x_pos + 30, 450,
				elo_to_rank_as_string(new_elo))
				.setOrigin(0.5,0.5)
				.setDisplaySize(100, 100);

			if (new_elo > old_elo)
			{
				this.add.text(x_pos, 450, "➜", style_arrow_green).setOrigin(0.5,0.5);
			}
			else
			{
				this.add.text(x_pos, 450, "➜", style_arrow_red).setOrigin(0.5,0.5);
			}
		}
		else
		{
			this.add.image(x_pos, 450,
				elo_to_rank_as_string(new_elo))
				.setOrigin(0.5,0.5)
				.setDisplaySize(100, 100);
		}
	}
}
