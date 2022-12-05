import 'phaser';
import {PlayerType, RoundSetup, EndResult, GameType } from '../types/shared.types';
import ClientSocketManager from '../client.socket.manager';
import {  await_load_base64, loadAvatar } from '../texture_loader';

import { elo_to_rank_as_string } from '../elo_tools';

import AssetRankSilver from '../../../../Images-Icons/Ranks/silver.png'
import AssetRankGold from '../../../../Images-Icons/Ranks/gold.png';
import AssetRankPlatine from '../../../../Images-Icons/Ranks/platine.png';
import AssetRankDiamond from '../../../../Images-Icons/Ranks/diamond.png';
import AssetRankChampion from '../../../../Images-Icons/Ranks/champion.png';
import AssetRankLegend from '../../../../Images-Icons/Ranks/legend.png';

import AssetButton from '../../../../Assets/images/button.png';


export default class Lobby extends Phaser.Scene
{
	constructor ()
	{
		super({ key: 'Lobby' });
	}

	socketmanager?: ClientSocketManager;

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

	message_text?: Phaser.GameObjects.Text;
	game_type: GameType = GameType.Singles;
	me: PlayerType = PlayerType.Spectator;

	anti_spam_count :number = 0;
	wait_delay: number = 0;
	connected: boolean = false;
	launching_game: boolean = false;

	preload ()
	{

		// sharp(this.game.registry.get('players_data').TeamBlue_Back.user, { pages: -1 }).toFile("output.png")

		loadAvatar(
			this.game.registry.get('players_data').TeamBlue_Back.user,
			'TeamBlue_back_avatar',
			this.registry.get('token'),
			this.registry.get('cache'),
			this);

		loadAvatar(
			this.game.registry.get('players_data').TeamRed_Back.user,
			'TeamRed_back_avatar',
			this.registry.get('token'),
			this.registry.get('cache'),
			 this);

		this.game_type = this.game.registry.get('players_data').game_settings.game_type;

		if (this.game_type === GameType.Doubles)
		{
			loadAvatar(
				this.game.registry.get('players_data').TeamBlue_Front.user,
				'TeamBlue_front_avatar',
				this.registry.get('token'),
				this.registry.get('cache'),
				 this);
			loadAvatar(
				this.game.registry.get('players_data').TeamBlue_Front.user,
				'TeamBlue_front_avatar',this.registry.get('token'),
				this.registry.get('cache'),
				 this);
		}

		await_load_base64(AssetRankSilver, "Silver", this);
		await_load_base64(AssetRankGold, "Gold", this);
		await_load_base64(AssetRankPlatine, "Platine", this);
		await_load_base64(AssetRankDiamond, "Diamond", this);
		await_load_base64(AssetRankChampion, "Champion", this);
		await_load_base64(AssetRankLegend, "Legend", this);


		this.load.image('button', AssetButton);
	}

	create ()
	{
		this.me = this.game.registry.get('players_data').player_type;
		this.socketmanager = new ClientSocketManager(this.game.registry.get('socket'));
		this.game.registry.set('socketmanager', this.socketmanager);

        this.socketmanager.set_lobby_triggers({
            ready_to_go: this.ready_to_go.bind(this),
			game_abort: this.game_abort.bind(this),
			store_round_setup: this.store_round_setup.bind(this),
			lobby_join: this.lobby_join.bind(this),
			game_end: this.game_end.bind(this)
        });

		this.TeamBlue_Back_avatar = this.add.image(130, 130,
								'TeamBlue_back_avatar')
								.setOrigin(0.5,0.5)
								.setDisplaySize(150, 150);
		this.TeamRed_Back_avatar = this.add.image(670, 130,
								'TeamRed_back_avatar')
								.setOrigin(0.5,0.5)
								.setDisplaySize(150, 150);

		let style: Phaser.Types.GameObjects.Text.TextStyle = 
		{
			fontSize: '30px',
			color: '#000000',
			fontFamily: 'Arial'
		}

		this.TeamBlue_Back_name = this.add.text(100, 360, "" +
								this.game.registry.get('players_data').TeamBlue_Back.user.username, style);
		this.TeamRed_Back_name = this.add.text(700, 360, "" +
								this.game.registry.get('players_data').TeamRed_Back.user.username, style);

		if (this.game_type === GameType.Doubles)
		{
			
			this.TeamBlue_Back_rank = this.add.image(75, 420,
									elo_to_rank_as_string(
									this.game.registry.get('players_data').TeamBlue_Back.user.doubles_elo))
									.setOrigin(0.5,0.5)
									.setDisplaySize(40, 40);
			this.TeamBlue_Back_elo = this.add.text(100, 420, "" +
									this.game.registry.get('players_data').TeamBlue_Back.user.doubles_elo, style);


			this.TeamBlue_Front_avatar = this.add.image(280, 130, 'TeamBlue_front_avatar')
										.setOrigin(0.5,0.5)
										.setDisplaySize(150, 150);
			this.TeamBlue_Front_rank = this.add.image(275, 420,
									elo_to_rank_as_string(
									this.game.registry.get('players_data').TeamBlue_Front.user.doubles_elo))
									.setOrigin(0.5,0.5)
									.setDisplaySize(40, 40);
			this.TeamBlue_Front_name = this.add.text(300, 360, "" +
									this.game.registry.get('players_data').TeamBlue_Front.user.username, style);
			this.TeamBlue_Front_elo = this.add.text(300, 420, "" +
									this.game.registry.get('players_data').TeamBlue_Front.user.doubles_elo, style);


			this.TeamRed_Front_avatar = this.add.image(520, 130, 'TeamRed_front_avatar')
									.setOrigin(0.5,0.5)
									.setDisplaySize(150, 150);
			this.TeamRed_Front_rank = this.add.image(475, 360,
									elo_to_rank_as_string(
									this.game.registry.get('players_data').TeamRed_Front.user.doubles_elo))
									.setOrigin(0.5,0.5)
									.setDisplaySize(40, 40);
			this.TeamRed_Front_name = this.add.text(500, 360, "" +
									this.game.registry.get('players_data').TeamRed_Front.user.username, style);
			this.TeamRed_Front_elo = this.add.text(500, 420, "" +
									this.game.registry.get('players_data').TeamRed_Front.user.doubles_elo, style);


			this.TeamRed_Back_rank = this.add.image(675, 420,
									elo_to_rank_as_string(
									this.game.registry.get('players_data').TeamRed_Back.user.doubles_elo))
									.setOrigin(0.5,0.5)
									.setDisplaySize(40, 40);
			this.TeamRed_Back_elo = this.add.text(700, 420, "" +
									this.game.registry.get('players_data').TeamRed_Back.user.doubles_elo, style);
		}
		else
		{
			this.TeamBlue_Back_rank = this.add.image(75, 420,
									elo_to_rank_as_string(
									this.game.registry.get('players_data').TeamBlue_Back.user.singles_elo))
									.setOrigin(0.5,0.5)
									.setDisplaySize(40, 40);
			this.TeamBlue_Back_elo = this.add.text(100, 420, "" +
									this.game.registry.get('players_data').TeamBlue_Back.user.singles_elo, style);
			
									
			this.TeamRed_Back_rank = this.add.image(675, 420,
									elo_to_rank_as_string(
									this.game.registry.get('players_data').TeamRed_Back.user.singles_elo))
									.setOrigin(0.5,0.5)
									.setDisplaySize(40, 40);
			this.TeamRed_Back_elo = this.add.text(700, 420, "" +
									this.game.registry.get('players_data').TeamRed_Back.user.singles_elo, style);
		}

		this.socketmanager.lobby_send_join(this.game.registry.get('players_data').game_id);
		this.socketmanager.lobby_send_request_status(this.registry.get('players_data').game_id);
	}

	update(): void
	{
		this.anti_spam_count++;
		if (this.anti_spam_count >= 5)
		{
			this.socketmanager!.lobby_send_request_status(this.registry.get('players_data').game_id);
			this.anti_spam_count = 0;
		}

		if (!this.connected)
		{
			this.wait_delay++;
			if (this.wait_delay >= 200)
			{
	
				this.server_connect_fail();
			}
		}
	}

	ready_to_go = () =>
	{
		if (this.launching_game)
			return;
		
		this.launching_game = true;
		this.socketmanager!.game_get_round_setup(this.game.registry.get('players_data').game_id);

		setTimeout(() => { 
			this.cameras.main.fadeOut(1000, 0, 0, 0);

		}, 1500);

		setTimeout(() => { 
			this.scene.start('Pong');
		}, 2500);
	}

	game_abort = () =>
	{
		this.clear_all();

		let style: Phaser.Types.GameObjects.Text.TextStyle = 
		{
			fontSize: '30px',
			color: '#000000',
			fontFamily: 'Arial'
		}
		this.message_text = this.add.text(400, 100, "Game aborted", style);

		setTimeout(() => {
			this.game.destroy(true, false);
		}, 10000);
	}

	store_round_setup = (round_setup: RoundSetup) =>
	{
		this.game.registry.set('round_setup', round_setup);
	}

	clear_all = () =>
	{
		this.TeamBlue_Back_avatar?.destroy();
		this.TeamBlue_Back_rank?.destroy();
		this.TeamBlue_Back_name?.destroy();
		this.TeamBlue_Back_elo?.destroy();

		this.TeamRed_Back_avatar?.destroy();
		this.TeamRed_Back_rank?.destroy();
		this.TeamRed_Back_name?.destroy();
		this.TeamRed_Back_elo?.destroy();

		if (this.game_type === GameType.Doubles)
		{
			this.TeamBlue_Front_avatar?.destroy();
			this.TeamBlue_Front_rank?.destroy();
			this.TeamBlue_Front_name?.destroy();
			this.TeamBlue_Front_elo?.destroy();
		
			this.TeamRed_Front_avatar?.destroy();
			this.TeamRed_Front_rank?.destroy();
			this.TeamRed_Front_name?.destroy();
			this.TeamRed_Front_elo?.destroy();
		}
	}

	server_connect_fail = () =>
	{
		this.clear_all();

		let style: Phaser.Types.GameObjects.Text.TextStyle = 
		{
			fontSize: '30px',
			color: '#000000',
			fontFamily: 'Arial'
		}
		this.message_text = this.add.text(400, 100, "Error: Could not connect to server", style);	
	}

	lobby_join = (response: boolean) =>
	{
		this.connected = true;
		if(!response)
		{
			this.clear_all();
			
			let style: Phaser.Types.GameObjects.Text.TextStyle = 
			{
				fontSize: '30px',
				color: '#000000',
				fontFamily: 'Arial'
			}
			this.message_text = this.add.text(400, 100, "Error: Lobby not found", style);

			setTimeout(() => {
				this.game.destroy(true, false);
			}, 10000);
		}
	}

	game_end = (winner: EndResult) =>
	{
		this.game.registry.set('winner', winner);

		this.scene.start('MatchResult');
	}

}
