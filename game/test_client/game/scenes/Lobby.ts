import 'phaser';
import { PlayersLobbyData, PlayerStatus, PlayerType } from '../types/shared.types';
import { io, Socket } from "socket.io-client";

export default class Lobby extends Phaser.Scene
{
	constructor ()
	{
		super({ key: 'Lobby' });
	}

	player?: PlayerType;
	player_A_is_ready: PlayerStatus = PlayerStatus.Absent;
	player_B_is_ready: PlayerStatus = PlayerStatus.Absent;
	socket?: Socket;
	
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
		'avatars/peach.jpg'
	  ); 
	}

	create ()
	{
		this.add.image(30, 30, 'player_a_avatar').setOrigin(0).setDisplaySize(200, 200);
		this.add.image(430, 30, 'player_b_avatar').setOrigin(0).setDisplaySize(200, 200);
		this.add.image(230, 230, 'ready_button').setOrigin(0).setDisplaySize(200, 200);

		this.player = this.game.registry.get('players_data').playertype;

		if (this.player == PlayerType.Player_A)
			console.log("you are player A");
		else if (this.player == PlayerType.Player_B)
			console.log("you are player B");
		else
			console.log("you are spectator");


		//this.ready_to_go();
		this.socket = io('http://localhost:6161');
		this.game.registry.set('socket', this.socket);


		let lobbydata: PlayersLobbyData = 
		{
			player_secret: this.game.registry.get('players_data').player_secret,
			game_id: this.game.registry.get('players_data').game_id
		};
		this.socket.emit('user_join_lobby', lobbydata);
		this.socket.emit('user_is_ready');
	}

	prepare_matchup = () => {
		
		if (this.player == PlayerType.Player_A)
		{
			
		}
		else if (this.player == PlayerType.Player_B)
		{
			
		}
		else
		{
			
		}
	}

	ready_to_go = () => {

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

	fading_out = () => {
		console.log('imagine the screen fading to black');

		this.scene.start('Pong');
	}
}