import 'phaser';
import { PlayersLobbyData, PlayerStatus, PlayerType } from '../types/shared.types';
import { io, Socket } from "socket.io-client";
import ClientSocketManager from '../client.socket.manager';

export default class Lobby extends Phaser.Scene
{
	constructor ()
	{
		super({ key: 'Lobby' });
	}

	socketmanager: ClientSocketManager = new ClientSocketManager();
	player_A_avatar;
	player_B_avatar;
	ready_button;
	// player?: PlayerType;
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
		this.game.registry.set('socketmanager', this.socketmanager);
        this.socketmanager.set_lobby_triggers({
            ready_to_go: this.ready_to_go.bind(this)

        });

		this.player_A_avatar = this.add.image(130, 130, 'player_a_avatar')
								.setOrigin(0.5,0.5)
								.setDisplaySize(200, 200);
		this.player_B_avatar = this.add.image(670, 130, 'player_b_avatar')
								.setOrigin(0.5,0.5)
								.setDisplaySize(200, 200);
		this.ready_button = this.add.image(400, 300, 'ready_button')
								.setOrigin(0.5,0.5).setName('ready')
								.setDisplaySize(200, 200)
								.setInteractive();

		let lobbydata: PlayersLobbyData = 
		{
			player_secret: this.game.registry.get('players_data').player_secret,
			game_id: this.game.registry.get('players_data').game_id
		};

		this.socketmanager.print_test();
		this.socketmanager.join_lobby(lobbydata);


		this.input.on('gameobjectdown',this.click_event);
	}

	update(/*time: number, delta: number*/): void {
		console.log("coucou5");

	}

	click_event = (pointer,gameObject) =>
	{
		pointer;
		
		console.log("click", gameObject);
		if (gameObject.name === 'ready')
		{

			console.log("object name is ready");
			this.socketmanager.send_ready();
		}
	}


	ready_to_go = () =>
	{

		console.log('ready to start');
		if (this instanceof Phaser.Scene)
		{
			this.time.addEvent({
				delay: 2000,
				callback: this.fading_out,
				loop: false
			});

		}

	}

	fading_out = () =>
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