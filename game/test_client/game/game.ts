
import { io } from "socket.io-client";
import 'phaser';


console.log("game.js loaded-")

export default class Pong extends Phaser.Scene
{
    socket;

    constructor ()
    {
        super('pong');
       //this.socket = io('http://localhost:6161');
    }

    preload ()
    {
        this.load.image('black_dot', 'assets/black_dot.png');
        this.load.image('red_bar', 'assets/red_bar.png');
        this.load.image('blue_bar', 'assets/blue_bar.png');
    }

    create ()
    {
        this.add.image(400, 300, 'black_dot');
        this.add.image(100, 300, 'red_bar');
        this.add.image(700, 300, 'blue_bar');
        this.socket = io.connect('http://localhost:6161');
    }
    
    atchoum()
    {
        console.log("atchoum");
    }
}

const config = {
    type: Phaser.AUTO,
    parent: 'game_anchor',
    backgroundColor: '#125555',
    width: 800,
    height: 600,
    scene: Pong
};


const game = new Phaser.Game(config);
