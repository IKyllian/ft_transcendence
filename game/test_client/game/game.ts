import 'phaser';
import Pong from './scenes/Pong';
//import Lobby from './scenes/Lobby';

console.log("pong.js running-")


const config = {
    type: Phaser.AUTO,
    parent: 'game_anchor',
    backgroundColor: '#125555',
    width: 800,
    height: 600,
    scene: [ Pong ]
};


const game = new Phaser.Game(config);

