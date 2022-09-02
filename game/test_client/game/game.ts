import 'phaser';
import Pong from './scenes/Pong';
import Lobby from './scenes/Lobby';

console.log("pong.js running-")


const config = {
    type: Phaser.AUTO,
    parent: 'game_anchor',
    backgroundColor: '#FFFFFF',
    width: 800,
    height: 600,
    callbacks: {
        preBoot: function (game) {
            console.log('config callback');
            game.registry.set('allo', 'Red Gem Stone');

         // game.registry.merge({'allo': 'coucou de preset value'});
        }
      },
    scene: [ Lobby, Pong ]
};


const game = new Phaser.Game(config);

