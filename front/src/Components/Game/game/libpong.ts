import 'phaser';
import { PlayersGameData } from './types/shared.types';
import { Socket } from 'socket.io-client';
import Pong from './scenes/Pong';
import Lobby from './scenes/Lobby';
import MatchResult from './scenes/MatchResult';
import ReplayPlayer from './scenes/ReplayPlayer';

export function launch_game(players_data: PlayersGameData, socket: Socket, token: string, cache: Cache | null | undefined, setHasEnded: Function): void
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
				game.registry.set('is_replay', false);
				game.registry.set('socket', socket);
				game.registry.set('token', token);
				game.registry.set('cache', cache);
				game.registry.set('setHasEnded', setHasEnded);
			}
		  },
		scene: [ Lobby, Pong, MatchResult ]
	};
	const game = new Phaser.Game(config);
}

export function watch_replay(game_id: string, socket: Socket): void
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
				game.registry.set('game_id', game_id);
				game.registry.set('is_replay', true);
				game.registry.set('socket', socket);
			}
		  },
		scene: [ ReplayPlayer, MatchResult ]
	};
	const game = new Phaser.Game(config);
}
