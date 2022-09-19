import 'phaser';
import { 
		PlayersLobbyData,
		PlayerStatus,
		PlayerType,
		LobbyStatus } from '../types/shared.types';
import { io, Socket } from "socket.io-client";
import ClientSocketManager from '../client.socket.manager';


export default class Lobby extends Phaser.Scene
{
	constructor ()
	{
		super({ key: 'Lobby' });
	}

	socketmanager: ClientSocketManager = new ClientSocketManager();
	launching: boolean = false;
	player_A_avatar;
	player_A_indicator;
	player_B_avatar;
	player_B_indicator;
	ready_button;
	countdown;
	me?: PlayerType;
	lobbystatus: LobbyStatus = 
	{
		player_A: PlayerStatus.Absent,
		player_B: PlayerStatus.Absent
	}
	// player_A_status: PlayerStatus = PlayerStatus.Absent;
	// player_B_status: PlayerStatus = PlayerStatus.Absent;
	
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
		'ready_button',
		'assets/button.png'
	  ); 
	}

	create ()
	{
		this.me = this.game.registry.get('players_data').playertype;
		this.game.registry.set('socketmanager', this.socketmanager);
        this.socketmanager.set_lobby_triggers({
            ready_to_go: this.ready_to_go.bind(this),
			update_lobby_status: this.update_lobby_status.bind(this)

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
		this.add.text(100, 320, "Win:" + this.game.registry.get('players_data').player_A.win, style);
		this.add.text(100, 360, "Loss:" + this.game.registry.get('players_data').player_A.loss, style);
		this.add.text(600, 320, "Win:" + this.game.registry.get('players_data').player_B.win, style);
		this.add.text(600, 360, "Loss:" + this.game.registry.get('players_data').player_B.loss, style);

		if (this.me !== PlayerType.Spectator)
		{
			this.ready_button = this.add.image(400, 400, 'ready_button')
									.setOrigin(0.5,0.5).setName('ready')
									.setDisplaySize(200, 200)
									.setInteractive();
		}

		let lobbydata: PlayersLobbyData = 
		{
			player_secret: this.game.registry.get('players_data').player_secret,
			game_id: this.game.registry.get('players_data').game_id
		};

		this.socketmanager.print_test();
		this.socketmanager.join_lobby(lobbydata);

		if (this.me !== PlayerType.Spectator)
		{
			this.input.on('gameobjectdown',this.click_event);
		}
	}

	update(/*time: number, delta: number*/): void {
		console.log("updating");
		// this.socketmanager (request updated data)
		this.socketmanager.request_lobby_status(this.registry.get('players_data').game_id);

	}

	click_event = (pointer: Phaser.Input.Pointer ,gameobject :Phaser.GameObjects.GameObject) =>
	{
		pointer;
		
		console.log("click", gameobject);
		if (gameobject.name === 'ready')
		{

			console.log("object name is ready");
			this.socketmanager.send_ready();
			gameobject.destroy();
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

		if (!this.launching)
		{
			this.launching = true;
			console.log('ready to start');
	
			this.update_lobby_status(
				{
					player_A: PlayerStatus.Ready,
					player_B: PlayerStatus.Ready
				});
	
			let timer: number = 5;
			let style: Phaser.Types.GameObjects.Text.TextStyle = 
			{
				fontSize: '40px',
				color: '#000000',
				fontFamily: 'Arial'
			}

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

		// if (this instanceof Phaser.Scene)
		// {
		// 	this.time.addEvent({
		// 		delay: 5000,
		// 		callback: this.launch_pong,
		// 		loop: false
		// 	});

		// }
	}

	launch_pong = () =>
	{
		console.log('imagine the screen fading to black');

		this.scene.start('Pong');
	}
}


/*
	// 	if (this.player == PlayerType.Player_A)
	// 	{
			
	// 	}
	// 	else if (this.player == PlayerType.Player_B)
	// 	{
			
	// 	}
	// 	else
	// 	{
			
	// 	}

		// this.player = this.game.registry.get('players_data').playertype;
		// this.socket = io('http://localhost:6161');
		// this.game.registry.set('socket', this.socket);

	
    //  Moves the image anchor to the middle, so it centers inside the game properly
    image.anchor.set(0.5);
	==>replaced by setorigin in phaser3

    //  Enables all kind of input actions on this image (click, etc)
    image.inputEnabled = true;
	==>replace by this.image.setInteractive(); in phaser3


var textConfig={fontSize:'20px',color:'#ff0000',fontFamily: 'Arial'};
this.add.text(game.config.width/2,game.config.height/2,textConfig,"SomeText",textConfig);


*/