import 'phaser';
import Pong from './scenes/Pong';
import Lobby from './scenes/Lobby';
import { Player } from './types'



export function launch_pong_duel(player: Player): void
{
	console.log('config launch_pong_duel');
	console.log('player.name', player.name);
	console.log('player.win', player.win);
	console.log('player.loss', player.loss);
	console.log('player.playertype', player.playertype);

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
				game.registry.set('player', player);
	
			 // game.registry.merge({'allo': 'coucou de preset value'});
			}
		  },
		scene: [ Lobby, Pong ]
	};
	
	
	const game = new Phaser.Game(config);
	
}