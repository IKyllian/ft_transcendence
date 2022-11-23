import 'phaser';
import { 
		PlayerStatus,
		PlayerType,
		LobbyStatus, 
		RoundSetup,
		EndResult,
		GameType} from '../types/shared.types';
import { io, Socket } from "socket.io-client";
import ClientSocketManager from '../client.socket.manager';
//import AssetButton from '../../../../Assets/images/button.png';


export default class Lobby extends Phaser.Scene
{
	constructor ()
	{
		super({ key: 'Lobby' });
	}

	socketmanager?: ClientSocketManager;

	TeamBlue_Back_avatar?: Phaser.GameObjects.Image;
	TeamBlue_Back_name?: Phaser.GameObjects.Text;

	TeamBlue_Front_avatar?: Phaser.GameObjects.Image;
	TeamBlue_Front_name?: Phaser.GameObjects.Text;

	TeamRed_Front_avatar?: Phaser.GameObjects.Image;
	TeamRed_Front_name?: Phaser.GameObjects.Text;

	TeamRed_Back_avatar?: Phaser.GameObjects.Image;
	TeamRed_Back_name?: Phaser.GameObjects.Text;

	message_text?: Phaser.GameObjects.Text;
	game_type: GameType = GameType.Singles;
	me: PlayerType = PlayerType.Spectator;

	anti_spam_count :number = 0;
	wait_delay: number = 0;
	connected: boolean = false;
	launching_game: boolean = false;

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


		// this.load.image(
		// 	'TeamBlue_back_avatar',
		// 	this.game.registry.get('players_data').TeamBlue_Back.user.avatar
		// 	);
		// this.load.image(
		// 	'TeamRed_back_avatar',
		// 	this.game.registry.get('players_data').TeamRed_Back.user.avatar
		// 	);

		// this.game_type = this.game.registry.get('players_data').game_settings.game_type;

		// if (this.game_type === GameType.Doubles)
		// {
		// 	this.load.image(
		// 		'TeamBlue_front_avatar',
		// 		this.game.registry.get('players_data').TeamBlue_Front.user.avatar
		// 		);
		// 	this.load.image(
		// 		'TeamRed_front_avatar',
		// 		this.game.registry.get('players_data').TeamRed_Front.user.avatar
		// 		);
		// }
	}

	create ()
	{
		this.me = this.game.registry.get('players_data').player_type;
		this.socketmanager = new ClientSocketManager(this.game.registry.get('socket'));
		this.game.registry.set('socketmanager', this.socketmanager);

        this.socketmanager.set_lobby_triggers({
            ready_to_go: this.ready_to_go.bind(this),
	//		update_lobby_status: this.update_lobby_status.bind(this),
			game_abort: this.game_abort.bind(this),
			store_round_setup: this.store_round_setup.bind(this),
			lobby_join: this.lobby_join.bind(this),
			game_end: this.game_end.bind(this)
        });

		this.TeamBlue_Back_avatar = this.add.image(130, 130, 'TeamBlue_back_avatar')
								.setOrigin(0.5,0.5)
								.setDisplaySize(150, 150);
		this.TeamRed_Back_avatar = this.add.image(670, 130, 'TeamRed_back_avatar')
								.setOrigin(0.5,0.5)
								.setDisplaySize(150, 150);

		if (this.game_type === GameType.Doubles)
		{
			this.TeamBlue_Front_avatar = this.add.image(280, 130, 'TeamBlue_front_avatar')
								.setOrigin(0.5,0.5)
								.setDisplaySize(150, 150);
			this.TeamRed_Front_avatar = this.add.image(520, 130, 'TeamRed_front_avatar')
								.setOrigin(0.5,0.5)
								.setDisplaySize(150, 150);
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

	// launch_pong = () =>
	// {
	// 	console.log('imagine the screen fading to black');

	// 	this.scene.start('Pong');
	// }

	clear_all = () =>
	{
		this.TeamBlue_Back_avatar?.destroy();
		// this.TeamBlue_Back_indicator?.destroy();
		this.TeamBlue_Back_name?.destroy();
		// this.TeamBlue_Back_win?.destroy();
		// this.TeamBlue_Back_loss?.destroy();

		this.TeamRed_Back_avatar?.destroy();
		// this.TeamRed_Back_indicator?.destroy();
		this.TeamRed_Back_name?.destroy();
		// this.TeamRed_Back_win?.destroy();
		// this.TeamRed_Back_loss?.destroy();

		if (this.game_type === GameType.Doubles)
		{
			this.TeamBlue_Front_avatar?.destroy();
			// this.TeamBlue_Front_indicator?.destroy();
			this.TeamBlue_Front_name?.destroy();
			// this.TeamBlue_Front_win?.destroy();
			// this.TeamBlue_Front_loss?.destroy();
		
			this.TeamRed_Front_avatar?.destroy();
			// this.TeamRed_Front_indicator?.destroy();
			this.TeamRed_Front_name?.destroy();
			// this.TeamRed_Front_win?.destroy();
			// this.TeamRed_Front_loss?.destroy();
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
