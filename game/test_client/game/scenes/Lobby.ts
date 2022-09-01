import 'phaser';

export default class Lobby extends Phaser.Scene
{
    constructor ()
    {
        super('lobby');
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
        this.add.image(450, 300, 'red_bar');
        this.add.image(500, 300, 'blue_bar');
    }
}