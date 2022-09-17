import 'phaser';
import { io } from "socket.io-client";
import ClientSocketManager from '../client.socket.manager';
import { PlayerType } from '../types/shared.types';

export default class Pong extends Phaser.Scene
{
    constructor ()
    {
        super({ key: 'Pong' });
    }
    test: PlayerType;
    socketmanager?: ClientSocketManager;

    preload ()
    {
        this.load.image('black_dot', 'assets/black_dot.png');
        this.load.image('red_bar', 'assets/red_bar.png');
        this.load.image('blue_bar', 'assets/blue_bar.png');
    }

    create ()
    {
        this.socketmanager = this.registry.get('socketmanager');

        this.add.image(400, 300, 'black_dot');
        this.add.image(100, 300, 'red_bar');
        this.add.image(700, 300, 'blue_bar');

        this.test = this.game.registry.get('players_data').playertype;

		if (this.test == PlayerType.Player_A)
			console.log("scene PONG you are player A");
		else if (this.test == PlayerType.Player_B)
			console.log("scene PONG you are player B");
		else
			console.log("scene PONG you are spectator");



        console.log('inside pong scene');
        if (this.socketmanager instanceof ClientSocketManager)
        {
            this.socketmanager.print_test();
        }
    }
}