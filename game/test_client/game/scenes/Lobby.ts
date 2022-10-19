import 'phaser';
import { 
		PlayersLobbyData,
		PlayerStatus,
		PlayerType,
		LobbyStatus, 
		RoundSetup,
		EndResult} from '../types/shared.types';
import { io, Socket } from "socket.io-client";
import ClientSocketManager from '../client.socket.manager';


export default class Lobby extends Phaser.Scene
{
	constructor ()
	{
		super({ key: 'Lobby' });
	}

	socketmanager: ClientSocketManager = new ClientSocketManager();
	//already_started: boolean = false;

	player_A_avatar: Phaser.GameObjects.Image;
	player_A_indicator: Phaser.GameObjects.Shape;
	player_A_name: Phaser.GameObjects.Text;
	player_A_win: Phaser.GameObjects.Text;
	player_A_loss: Phaser.GameObjects.Text;

	player_B_avatar: Phaser.GameObjects.Image;
	player_B_indicator: Phaser.GameObjects.Shape;
	player_B_name: Phaser.GameObjects.Text;
	player_B_win: Phaser.GameObjects.Text;
	player_B_loss: Phaser.GameObjects.Text;
	ready_button: Phaser.GameObjects.Image;
	countdown: Phaser.GameObjects.Text;
	me: PlayerType = PlayerType.Spectator;
	lobbystatus: LobbyStatus = 
	{
		player_A: PlayerStatus.Absent,
		player_B: PlayerStatus.Absent
	}
	anti_spam_count :number = 0;
	wait_delay: number = 0;
	connected: boolean = false;


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
		this.game.registry.set('socketmanager', this.socketmanager);

        this.socketmanager.set_lobby_triggers({
            ready_to_go: this.ready_to_go.bind(this),
			update_lobby_status: this.update_lobby_status.bind(this),
			store_round_setup: this.store_round_setup.bind(this),
			lobby_join: this.lobby_join.bind(this),
			game_end: this.game_end.bind(this)

        });

		this.player_A_avatar = this.add.image(130, 130, 'player_a_avatar')
								.setOrigin(0.5,0.5)
								.setDisplaySize(200, 200);
		this.player_B_avatar = this.add.image(670, 130, 'player_b_avatar')
								.setOrigin(0.5,0.5)
								.setDisplaySize(200, 200);

		this.player_A_indicator = this.add.circle(200, 240, 50, 0x000000);
		this.player_B_indicator = this.add.circle(600, 240, 50, 0x000000);

		let style: Phaser.Types.GameObjects.Text.TextStyle = 
		{
			fontSize: '30px',
			color: '#000000',
			fontFamily: 'Arial'
		}
		this.player_A_win = this.add.text(100, 320, "Win:" + this.game.registry.get('players_data').player_A.win, style);
		this.player_A_loss = this.add.text(100, 360, "Loss:" + this.game.registry.get('players_data').player_A.loss, style);
		this.player_B_win = this.add.text(600, 320, "Win:" + this.game.registry.get('players_data').player_B.win, style);
		this.player_B_loss = this.add.text(600, 360, "Loss:" + this.game.registry.get('players_data').player_B.loss, style);

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

	update(/*time: number, delta: number*/): void
	{
		this.anti_spam_count++;
		if (this.anti_spam_count >= 5)
		{
			this.socketmanager.lobby_send_request_status(this.registry.get('players_data').game_id);
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
			this.socketmanager.lobby_send_ready(this.registry.get('players_data').game_id);
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

		if (this.lobbystatus.player_A === PlayerStatus.Present)
		{
			this.player_A_indicator.setFillStyle(0xf2fc23);
		}
		else if (this.lobbystatus.player_A === PlayerStatus.Ready)
		{
			this.player_A_indicator.setFillStyle(0x43f33b);
		}
		else
		{
			this.player_A_indicator.setFillStyle(0xff0000);
		}

		if (this.lobbystatus.player_B === PlayerStatus.Present)
		{
			this.player_B_indicator.setFillStyle(0xf2fc23);
		}
		else if (this.lobbystatus.player_B === PlayerStatus.Ready)
		{
			this.player_B_indicator.setFillStyle(0x43f33b);
		}
		else
		{
			this.player_B_indicator.setFillStyle(0xff0000);
		}
	}

	ready_to_go = () =>
	{
		console.log('ready to start');

		this.update_lobby_status(
			{
				player_A: PlayerStatus.Ready,
				player_B: PlayerStatus.Ready
			});

		let timer: number = 1;
		let style: Phaser.Types.GameObjects.Text.TextStyle = 
		{
			fontSize: '40px',
			color: '#000000',
			fontFamily: 'Arial'
		}

		this.socketmanager.game_get_round_setup(this.game.registry.get('players_data').game_id);
		this.countdown = this.add.text(400, 100, timer.toString(), style);

		this.time.addEvent({
			delay: 1000,
			callback: function()
			{
				timer -= 1;
				console.log("countdown:", timer);
				this.countdown.setText(timer.toString());
				if (timer <= 0)
				{
					this.countdown.destroy();
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
		this.player_A_avatar.destroy();
		this.player_A_indicator.destroy();
		this.player_A_win.destroy();
		this.player_A_loss.destroy();

		this.player_B_avatar.destroy();
		this.player_B_indicator.destroy();
		this.player_B_win.destroy();
		this.player_B_loss.destroy();

		// if (this.me !== PlayerType.Spectator)
		// {
		// 	this.ready_button.destroy();
		// }
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
