import 'phaser';
import { PlayersGameData } from './types/shared.types';
import { Socket } from 'socket.io-client';
import Pong from './scenes/Pong';
import Lobby from './scenes/Lobby';
import MatchResult from './scenes/MatchResult';

export function launch_game(players_data: PlayersGameData, socket: Socket, token: string, cache: Cache | null | undefined, setHasEnded: Function): Phaser.Game
{
	const config = {
		type: Phaser.AUTO,
		scale: {
			mode: Phaser.Scale.FIT,
			autoCenter: Phaser.Scale.CENTER_BOTH,
			parent: 'game_anchor',
			width: 800,
			height: 600
		},
		parent: 'game_anchor',
		backgroundColor: '#FFFFFF',
		width: 800,
		height: 600,
		callbacks: {
			preBoot: function (game: any) {
				game.registry.set('players_data', players_data);
				game.registry.set('socket', socket);
				game.registry.set('token', token);
				game.registry.set('cache', cache);
				game.registry.set('setHasEnded', setHasEnded);
			}
		  },
		scene: [ Lobby, Pong, MatchResult ]
	};
	const game = new Phaser.Game(config);
	console.log(game);
	return game;
}
