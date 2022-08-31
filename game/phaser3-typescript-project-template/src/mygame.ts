import 'phaser';

export default class Pong extends Phaser.Scene 
{
	constructor() {
        super('Pong');
    }

	preload ()
    {
        this.load.image('logo', 'assets/phaser3-logo.png');
    }
	create ()
    {
		this.add.image(400, 70, 'logo');
    }
}


const config: any = {
    type: Phaser.AUTO,
    parent: 'game_anchor',
    width: 800,
    height: 600,
    backgroundColor: "#3498db",
    scene: Pong
};

new Phaser.Game(config);