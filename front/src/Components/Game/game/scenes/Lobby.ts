import 'phaser';
import { 
		PlayersLobbyData,
		PlayerStatus,
		PlayerType,
		LobbyStatus, 
		RoundSetup,
		EndResult,
		GameType} from '../types/shared.types';
import { io, Socket } from "socket.io-client";
import ClientSocketManager from '../client.socket.manager';


export default class Lobby extends Phaser.Scene
{
	constructor ()
	{
		super({ key: 'Lobby' });
	}

	socketmanager?: ClientSocketManager;

	Player_A_Back_avatar?: Phaser.GameObjects.Image;
	Player_A_Back_indicator?: Phaser.GameObjects.Shape;
	Player_A_Back_name?: Phaser.GameObjects.Text;
	Player_A_Back_win?: Phaser.GameObjects.Text;
	Player_A_Back_loss?: Phaser.GameObjects.Text;
	
	Player_A_Front_avatar?: Phaser.GameObjects.Image;
	Player_A_Front_indicator?: Phaser.GameObjects.Shape;
	Player_A_Front_name?: Phaser.GameObjects.Text;
	Player_A_Front_win?: Phaser.GameObjects.Text;
	Player_A_Front_loss?: Phaser.GameObjects.Text;

	Player_B_Front_avatar?: Phaser.GameObjects.Image;
	Player_B_Front_indicator?: Phaser.GameObjects.Shape;
	Player_B_Front_name?: Phaser.GameObjects.Text;
	Player_B_Front_win?: Phaser.GameObjects.Text;
	Player_B_Front_loss?: Phaser.GameObjects.Text;

	Player_B_Back_avatar?: Phaser.GameObjects.Image;
	Player_B_Back_indicator?: Phaser.GameObjects.Shape;
	Player_B_Back_name?: Phaser.GameObjects.Text;
	Player_B_Back_win?: Phaser.GameObjects.Text;
	Player_B_Back_loss?: Phaser.GameObjects.Text;
	

	ready_button?: Phaser.GameObjects.Image;
	countdown?: Phaser.GameObjects.Text;


	game_type: GameType = GameType.Singles;
	me: PlayerType = PlayerType.Spectator;
	lobbystatus: LobbyStatus = 
	{
		Player_A_Back: PlayerStatus.Absent,
		Player_A_Front: PlayerStatus.Absent,
		Player_B_Front: PlayerStatus.Absent,
		Player_B_Back: PlayerStatus.Absent,
	}

	anti_spam_count :number = 0;
	wait_delay: number = 0;
	connected: boolean = false;


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
		this.socketmanager = new ClientSocketManager(this.game.registry.get('socket'));
		this.game.registry.set('socketmanager', this.socketmanager);

        this.socketmanager.set_lobby_triggers({
            ready_to_go: this.ready_to_go.bind(this),
			update_lobby_status: this.update_lobby_status.bind(this),
			store_round_setup: this.store_round_setup.bind(this),
			lobby_join: this.lobby_join.bind(this),
			game_end: this.game_end.bind(this)

        });

		this.Player_A_Back_avatar = this.add.image(130, 130, 'player_a_back_avatar')
								.setOrigin(0.5,0.5)
								.setDisplaySize(150, 150);
		this.Player_B_Back_avatar = this.add.image(670, 130, 'player_b_back_avatar')
								.setOrigin(0.5,0.5)
								.setDisplaySize(150, 150);

		this.Player_A_Back_indicator = this.add.circle(150, 240, 50, 0x000000);
		this.Player_B_Back_indicator = this.add.circle(650, 240, 50, 0x000000);

		let style: Phaser.Types.GameObjects.Text.TextStyle = 
		{
			fontSize: '30px',
			color: '#000000',
			fontFamily: 'Arial'
		}
		this.Player_A_Back_win = this.add.text(100, 320, "Win:" + this.game.registry.get('players_data').Player_A_Back.win, style);
		this.Player_A_Back_loss = this.add.text(100, 360, "Loss:" + this.game.registry.get('players_data').Player_A_Back.loss, style);
		this.Player_B_Back_win = this.add.text(700, 320, "Win:" + this.game.registry.get('players_data').Player_B_Back.win, style);
		this.Player_B_Back_loss = this.add.text(700, 360, "Loss:" + this.game.registry.get('players_data').Player_B_Back.loss, style);


		if (this.game_type === GameType.Doubles)
		{
			this.Player_A_Front_avatar = this.add.image(280, 130, 'player_a_front_avatar')
								.setOrigin(0.5,0.5)
								.setDisplaySize(150, 150);
			this.Player_B_Front_avatar = this.add.image(520, 130, 'player_b_front_avatar')
								.setOrigin(0.5,0.5)
								.setDisplaySize(150, 150);

			this.Player_A_Front_indicator = this.add.circle(300, 240, 50, 0x000000);
			this.Player_B_Front_indicator = this.add.circle(500, 240, 50, 0x000000);

			this.Player_A_Front_win = this.add.text(300, 320, "Win:" + this.game.registry.get('players_data').Player_A_Front.win, style);
			this.Player_A_Front_loss = this.add.text(300, 360, "Loss:" + this.game.registry.get('players_data').Player_A_Front.loss, style);
			this.Player_B_Front_win = this.add.text(500, 320, "Win:" + this.game.registry.get('players_data').Player_B_Front.win, style);
			this.Player_B_Front_loss = this.add.text(500, 360, "Loss:" + this.game.registry.get('players_data').Player_B_Front.loss, style);
		
		}

		if (this.me !== PlayerType.Spectator)
		{
			this.ready_button = this.add.image(400, 400, 'button')
									.setOrigin(0.5,0.5).setName('ready')
									.setDisplaySize(200, 200)
									.setInteractive();
		}

		let lobbydata: PlayersLobbyData = 
		{
			player_secret: this.game.registry.get('players_data').player_secret,
			game_id: this.game.registry.get('players_data').game_id
		};

		this.socketmanager.lobby_send_join(lobbydata);

		if (this.me !== PlayerType.Spectator)
		{
			this.input.on('gameobjectdown',this.click_event);
		}
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

	click_event = (pointer: Phaser.Input.Pointer ,gameobject :Phaser.GameObjects.GameObject) =>
	{
		pointer;
		
		console.log("click", gameobject);
		if (gameobject.name === 'ready')
		{
			this.socketmanager!.lobby_send_ready(this.registry.get('players_data').game_id);
			gameobject.destroy();
		}

		if (gameobject.name === 'exit')
		{
			this.game.destroy(true, false);
		}
	}

	update_lobby_status = (new_status: LobbyStatus) =>
	{
		this.lobbystatus = new_status;

		if (this.lobbystatus.Player_A_Back === PlayerStatus.Present)
		{
			this.Player_A_Back_indicator?.setFillStyle(0xf2fc23);
		}
		else if (this.lobbystatus.Player_A_Back === PlayerStatus.Ready)
		{
			this.Player_A_Back_indicator?.setFillStyle(0x43f33b);
		}
		else
		{
			this.Player_A_Back_indicator?.setFillStyle(0xff0000);
		}

		if (this.lobbystatus.Player_B_Back === PlayerStatus.Present)
		{
			this.Player_B_Back_indicator?.setFillStyle(0xf2fc23);
		}
		else if (this.lobbystatus.Player_B_Back === PlayerStatus.Ready)
		{
			this.Player_B_Back_indicator?.setFillStyle(0x43f33b);
		}
		else
		{
			this.Player_B_Back_indicator?.setFillStyle(0xff0000);
		}


		if (this.game_type === GameType.Doubles)
		{
			if (this.lobbystatus.Player_A_Front === PlayerStatus.Present)
			{
				this.Player_A_Front_indicator?.setFillStyle(0xf2fc23);
			}
			else if (this.lobbystatus.Player_A_Front === PlayerStatus.Ready)
			{
				this.Player_A_Front_indicator?.setFillStyle(0x43f33b);
			}
			else
			{
				this.Player_A_Front_indicator?.setFillStyle(0xff0000);
			}
	
			if (this.lobbystatus.Player_B_Front === PlayerStatus.Present)
			{
				this.Player_B_Front_indicator?.setFillStyle(0xf2fc23);
			}
			else if (this.lobbystatus.Player_B_Front === PlayerStatus.Ready)
			{
				this.Player_B_Front_indicator?.setFillStyle(0x43f33b);
			}
			else
			{
				this.Player_B_Front_indicator?.setFillStyle(0xff0000);
			}	
		}

	}

	ready_to_go = () =>
	{
		console.log('ready to start');

		this.update_lobby_status(
			{
				Player_A_Back: PlayerStatus.Ready,
				Player_A_Front: PlayerStatus.Ready,
				Player_B_Front: PlayerStatus.Ready,
				Player_B_Back: PlayerStatus.Ready,
			});

		let timer: number = 1;
		let style: Phaser.Types.GameObjects.Text.TextStyle = 
		{
			fontSize: '40px',
			color: '#000000',
			fontFamily: 'Arial'
		}

		this.socketmanager!.game_get_round_setup(this.game.registry.get('players_data').game_id);
		this.countdown = this.add.text(400, 100, timer.toString(), style);

		this.time.addEvent({
			delay: 1000,
			callback: () =>
			{
				timer -= 1;
				console.log("countdown:", timer);
				// this.countdown.setText(timer.toString());
				if (timer <= 0)
				{
					// this.countdown.destroy();
					this.launch_pong();
				}
			},
			callbackScope: this,
			loop: true });


	}

	store_round_setup = (round_setup: RoundSetup) =>
	{
		this.game.registry.set('round_setup', round_setup);
	}

	launch_pong = () =>
	{
		console.log('imagine the screen fading to black');

		this.scene.start('Pong');
	}

	clear_all = () =>
	{
		this.Player_A_Back_avatar?.destroy();
		this.Player_A_Back_indicator?.destroy();
		this.Player_A_Back_name?.destroy();
		this.Player_A_Back_win?.destroy();
		this.Player_A_Back_loss?.destroy();

		this.Player_B_Back_avatar?.destroy();
		this.Player_B_Back_indicator?.destroy();
		this.Player_B_Back_name?.destroy();
		this.Player_B_Back_win?.destroy();
		this.Player_B_Back_loss?.destroy();

		if (this.game_type === GameType.Doubles)
		{
			this.Player_A_Front_avatar?.destroy();
			this.Player_A_Front_indicator?.destroy();
			this.Player_A_Front_name?.destroy();
			this.Player_A_Front_win?.destroy();
			this.Player_A_Front_loss?.destroy();
		
			this.Player_B_Front_avatar?.destroy();
			this.Player_B_Front_indicator?.destroy();
			this.Player_B_Front_name?.destroy();
			this.Player_B_Front_win?.destroy();
			this.Player_B_Front_loss?.destroy();
		}

	}


	server_connect_fail = () =>
	{
		this.clear_all();
		
		this.ready_button = this.add.image(400, 400, 'button')
		.setOrigin(0.5,0.5).setName('exit')
		.setDisplaySize(200, 200)
		.setInteractive();

		let style: Phaser.Types.GameObjects.Text.TextStyle = 
		{
			fontSize: '30px',
			color: '#000000',
			fontFamily: 'Arial'
		}

		this.countdown = this.add.text(400, 100, "Error: Could not connect to server", style);	
	}

	lobby_join = (response: boolean) =>
	{
		this.connected = true;
		if(!response)
		{
			this.clear_all();
			
			this.ready_button = this.add.image(400, 400, 'button')
			.setOrigin(0.5,0.5).setName('exit')
			.setDisplaySize(200, 200)
			.setInteractive();
	
			let style: Phaser.Types.GameObjects.Text.TextStyle = 
			{
				fontSize: '30px',
				color: '#000000',
				fontFamily: 'Arial'
			}
	
			this.countdown = this.add.text(400, 100, "Error: Lobby not found", style);

		}
	}

	game_end = (winner: EndResult) =>
	{
		this.game.registry.set('winner', winner);

		this.scene.start('MatchResult');
	}

}
