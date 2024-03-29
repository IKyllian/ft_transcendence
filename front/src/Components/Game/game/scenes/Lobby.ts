import 'phaser';
import {PlayerType, RoundSetup, EndResult, GameType } from '../types/shared.types';
import ClientSocketManager from '../client.socket.manager';
import {  await_load_base64, loadAvatar } from '../utils/texture_loader';

import { elo_to_rank_as_string } from '../utils/elo_tools';
import { shorten_nickname } from '../utils/text_tools';
import { make_style } from '../utils/text_tools';

import AssetRankSilver from '../../../../Assets/Ranks/silver.png'
import AssetRankGold from '../../../../Assets/Ranks/gold.png';
import AssetRankPlatine from '../../../../Assets/Ranks/platine.png';
import AssetRankDiamond from '../../../../Assets/Ranks/diamond.png';
import AssetRankChampion from '../../../../Assets/Ranks/champion.png';
import AssetRankLegend from '../../../../Assets/Ranks/legend.png';
import Pong from './Pong';


import AssetSoundA from '../../../../Assets/sound/ponghitside.ogg'
import AssetSoundB from '../../../../Assets/sound/ponghitpad.ogg'
import AssetSoundClapping from '../../../../Assets/sound/clapping.ogg'
import AssetImageLagIcon from '../../../../Assets/images/lagicon.png'

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
	message_text_b?: Phaser.GameObjects.Text;
	game_stakes?: Phaser.GameObjects.Text;
	close_button?: Phaser.GameObjects.Image;


	game_type: GameType = GameType.Singles;
	me: PlayerType = PlayerType.Spectator;


	anti_spam_count :number = 0;
	wait_delay: number = 0;
	connected: boolean = false;
	launching_game: boolean = false;

	update_interval: any;
	load_interval: any;

	fadeout_timeout: any;
	pongstart_timeout: any;
	error_timeout: any;

	audio_a_loader?: Phaser.Loader.LoaderPlugin;
	audio_b_loader?: Phaser.Loader.LoaderPlugin;
	audio_c_loader?: Phaser.Loader.LoaderPlugin;

	preload ()
	{
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
				this.game.registry.get('players_data').TeamRed_Front.user,
				'TeamRed_front_avatar',
				this.registry.get('token'),
				this.registry.get('cache'),
				 this);
		}

		await_load_base64(AssetRankSilver, "Silver", this);
		await_load_base64(AssetRankGold, "Gold", this);
		await_load_base64(AssetRankPlatine, "Platine", this);
		await_load_base64(AssetRankDiamond, "Diamond", this);
		await_load_base64(AssetRankChampion, "Champion", this);
		await_load_base64(AssetRankLegend, "Legend", this);	
		await_load_base64(AssetImageLagIcon, 'lag_icon', this);	
		this.audio_a_loader = this.load.audio('sound_a', AssetSoundA);
		this.audio_b_loader = this.load.audio('sound_b', AssetSoundB);
		this.audio_c_loader = this.load.audio('clapping', AssetSoundClapping);


		clearInterval(this.load_interval);
		this.load_interval = setInterval(
			(function(self) { return function()
			  {
				if (self.audio_a_loader !== undefined
					&& self.audio_b_loader !== undefined
					&& self.audio_c_loader !== undefined)
					{
						if (
							self.textures.exists('Silver')
							&& self.textures.exists('Gold')
							&& self.textures.exists('Platine')
							&& self.textures.exists('Diamond')
							&& self.textures.exists('Champion')
							&& self.textures.exists('Legend')
							&& self.textures.exists('lag_icon')
							&& !self.audio_a_loader.isLoading()
							&& !self.audio_b_loader.isLoading()
							&& !self.audio_c_loader.isLoading()
						)
						{
		
							if (self.game_type === GameType.Doubles)
							{
								if (
									self.textures.exists('TeamBlue_back_avatar')
									&& self.textures.exists('TeamRed_back_avatar')
									&& self.textures.exists('TeamBlue_front_avatar')
									&& self.textures.exists('TeamRed_front_avatar')
								)
								{
										self.display();
									self.update_interval = setInterval(() => {
										self.check_status();
									}, 1000 / 30);
									clearInterval(self.load_interval);
								}
							}
							else
							{
								if(
									self.textures.exists('TeamBlue_back_avatar')
									&& self.textures.exists('TeamRed_back_avatar')
								)
								{
										self.display();
									self.update_interval = setInterval(() => {
										self.check_status();
									}, 1000 / 30);
									clearInterval(self.load_interval);
								}
							}
						}
					}


			  }; })(this), 50);
	}

	display ()
	{

		this.cameras.main.setBackgroundColor("#415A77");

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

		this.message_text = this.add.text(400, 260, "V", make_style(72, "#0059FF")).setOrigin(1,0.5);
		this.message_text_b = this.add.text(400, 260, "S", make_style(72, "#F91900")).setOrigin(0,0.5);

		this.TeamBlue_Back_avatar = this.add.image(100, 130,
								'TeamBlue_back_avatar')
								.setOrigin(0.5,0.5)
								.setDisplaySize(175, 175);
		this.TeamRed_Back_avatar = this.add.image(700, 130,
								'TeamRed_back_avatar')
								.setOrigin(0.5,0.5)
								.setDisplaySize(175, 175);

		this.TeamBlue_Back_name = this.add.text(100, 310,
								shorten_nickname(this.game.registry.get('players_data').TeamBlue_Back.user.username),
								make_style(26))
								.setOrigin(0.5,0.5);
		this.TeamRed_Back_name = this.add.text(700, 310,
								shorten_nickname(this.game.registry.get('players_data').TeamRed_Back.user.username),
								make_style(26))
								.setOrigin(0.5,0.5);


		if (this.game_type === GameType.Doubles)
		{
			this.TeamBlue_Front_avatar = this.add.image(285, 130, 'TeamBlue_front_avatar')
										.setOrigin(0.5,0.5)
										.setDisplaySize(175, 175);
			this.TeamBlue_Front_name = this.add.text(285, 310,
										shorten_nickname(this.game.registry.get('players_data').TeamBlue_Front.user.username),
										make_style(26))
										.setOrigin(0.5,0.5);


			this.TeamRed_Front_avatar = this.add.image(515, 130, 'TeamRed_front_avatar')
										.setOrigin(0.5,0.5)
										.setDisplaySize(175, 175);
			this.TeamRed_Front_name = this.add.text(515, 310,
									shorten_nickname(this.game.registry.get('players_data').TeamRed_Front.user.username),
									make_style(26))
									.setOrigin(0.5,0.5);
		}



		if (this.game.registry.get('players_data').game_settings.is_ranked)
		{
			this.game_stakes = this.add.text(400, 550, "Ranked Match", make_style(32)).setOrigin(0.5,0.5);
			if (this.game_type === GameType.Doubles)
			{
				
				this.TeamBlue_Back_rank = this.add.image(100, 450,
										elo_to_rank_as_string(
										this.game.registry.get('players_data').TeamBlue_Back.user.doubles_elo))
										.setOrigin(0.5,0.5)
										.setDisplaySize(75, 75);
				this.TeamBlue_Back_elo = this.add.text(100, 360, "" +
										this.game.registry.get('players_data').TeamBlue_Back.user.doubles_elo, make_style(22)).setOrigin(0.5,0.5);
	
	
				this.TeamRed_Back_rank = this.add.image(700, 450,
											elo_to_rank_as_string(
											this.game.registry.get('players_data').TeamRed_Back.user.doubles_elo))
											.setOrigin(0.5,0.5)
											.setDisplaySize(75, 75);
				this.TeamRed_Back_elo = this.add.text(700, 360, "" +
											this.game.registry.get('players_data').TeamRed_Back.user.doubles_elo, make_style(22)).setOrigin(0.5,0.5);
	
				this.TeamBlue_Front_rank = this.add.image(285, 450,
										elo_to_rank_as_string(
										this.game.registry.get('players_data').TeamBlue_Front.user.doubles_elo))
										.setOrigin(0.5,0.5)
										.setDisplaySize(75, 75);
				this.TeamBlue_Front_elo = this.add.text(285, 360, "" +
										this.game.registry.get('players_data').TeamBlue_Front.user.doubles_elo, make_style(22)).setOrigin(0.5,0.5);
	
				this.TeamRed_Front_rank = this.add.image(515, 450,
										elo_to_rank_as_string(
										this.game.registry.get('players_data').TeamRed_Front.user.doubles_elo))
										.setOrigin(0.5,0.5)
										.setDisplaySize(75, 75);
				this.TeamRed_Front_elo = this.add.text(515, 360, "" +
										this.game.registry.get('players_data').TeamRed_Front.user.doubles_elo, make_style(22)).setOrigin(0.5,0.5);
	
			}
			else
			{
				this.TeamBlue_Back_rank = this.add.image(100, 450,
										elo_to_rank_as_string(
										this.game.registry.get('players_data').TeamBlue_Back.user.singles_elo))
										.setOrigin(0.5,0.5)
										.setDisplaySize(75, 75);
				this.TeamBlue_Back_elo = this.add.text(100, 360, "" +
										this.game.registry.get('players_data').TeamBlue_Back.user.singles_elo, make_style(22)).setOrigin(0.5,0.5);
				
										
				this.TeamRed_Back_rank = this.add.image(700, 450,
										elo_to_rank_as_string(
										this.game.registry.get('players_data').TeamRed_Back.user.singles_elo))
										.setOrigin(0.5,0.5)
										.setDisplaySize(75, 75);
				this.TeamRed_Back_elo = this.add.text(700, 360, "" +
										this.game.registry.get('players_data').TeamRed_Back.user.singles_elo, make_style(22)).setOrigin(0.5,0.5);
			}
		}
		else
		{
			this.game_stakes = this.add.text(400, 550, "Showmatch", make_style(32)).setOrigin(0.5,0.5);
		}


		this.socketmanager.lobby_send_join(this.game.registry.get('players_data').game_id);
		this.socketmanager.lobby_send_request_status(this.registry.get('players_data').game_id);
	}

	check_status()
	{
		this.anti_spam_count++;
		if (this.anti_spam_count >= 5)
		{
			if (this.socketmanager instanceof ClientSocketManager)
			{
				this.socketmanager.lobby_send_request_status(this.registry.get('players_data').game_id);
			}
			this.anti_spam_count = 0;
		}

		if (!this.connected)
		{
			this.wait_delay++;
			if (this.wait_delay >= 300)
			{
				clearInterval(this.update_interval);
				this.server_connect_fail();
			}
		}
	}

	ready_to_go = () =>
	{
		if (this.launching_game)
			return;
		
		this.launching_game = true;
		this.socketmanager?.game_get_round_setup(this.game.registry.get('players_data').game_id);
		clearInterval(this.update_interval);

		clearTimeout(this.fadeout_timeout);
		this.fadeout_timeout = setTimeout(() => { 
				this.cameras.main.fadeOut(1000, 0, 0, 0);
		}, 1500);

		clearTimeout(this.pongstart_timeout);
		this.pongstart_timeout = setTimeout(() => { 
				this.scene.start('Pong');
		}, 2500);
	}

	game_abort = () =>
	{
		this.clear_all();
		clearInterval(this.update_interval);

		this.message_text = this.add.text(400, 100,
							"Someone Failed\nto join\nGame aborted",
							make_style(30))
							.setOrigin(0.5,0.5);

		clearTimeout(this.error_timeout);
		this.error_timeout = setTimeout(() => {
			this.game.registry.get('setHasEnded')(true);
			this.game.destroy(true, false);
		}, 5000);
	}

	store_round_setup = (round_setup: RoundSetup) =>
	{
		this.game.registry.set('round_setup', round_setup);
	}

	clear_all = () =>
	{
		this.message_text?.destroy();
		this.message_text_b?.destroy();
		this.game_stakes?.destroy();

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
		clearInterval(this.update_interval);

		this.message_text = this.add.text(400, 100,
			"Error: \nCould not connect to server",
			 make_style(30))
			 .setOrigin(0.5,0.5);

		clearTimeout(this.error_timeout);
		this.error_timeout = setTimeout(() => {
			this.game.registry.get('setHasEnded')(true);
			this.game.destroy(true, false);
		}, 5000);
	}

	lobby_join = (response: boolean) =>
	{
		this.connected = true;
		if(!response)
		{
			this.clear_all();
			clearInterval(this.update_interval);

			this.message_text = this.add.text(400, 100,
								"Error: \nLobby not found",
								make_style(30))
								.setOrigin(0.5,0.5);

			clearTimeout(this.error_timeout);
			this.error_timeout = setTimeout(() => {
				this.game.registry.get('setHasEnded')(true);
				this.game.destroy(true, false);
			}, 5000);
		}
	}

	game_end = (winner: EndResult) =>
	{
		this.game.registry.set('winner', winner);
		clearInterval(this.update_interval);

		this.scene.start('MatchResult');
	}

}
