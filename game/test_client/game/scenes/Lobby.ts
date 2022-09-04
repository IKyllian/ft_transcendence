import 'phaser';
import { PlayerType } from '../types';
import { io, Socket } from "socket.io-client";

export default class Lobby extends Phaser.Scene
{
	constructor ()
	{
		super({ key: 'Lobby' });
	}

	player: PlayerType;
	A_isready: boolean;
	B_isready: boolean;
	socket: Socket;
	
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
	}

	create ()
	{
		this.add.image(30, 30, 'player_a_avatar').setOrigin(0).setDisplaySize(200, 200);
		this.add.image(430, 30, 'player_b_avatar').setOrigin(0).setDisplaySize(200, 200);

		this.player = this.game.registry.get('players_data').playertype;

		if (this.player == PlayerType.Player_A)
			console.log("you are player A");
		else if (this.player == PlayerType.Player_B)
			console.log("you are player B");
		else
			console.log("you are spectator");


		//this.ready_to_go();

	}

	prepare_matchup = () => {
		this.socket = io('http://localhost:6161');
		this.game.registry.set('socket', this.socket);
		
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