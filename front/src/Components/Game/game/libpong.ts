import 'phaser';
import Pong from './scenes/Pong';
import Lobby from './scenes/Lobby';
import { PlayersGameData } from './types/shared.types';
import { io, Socket } from 'socket.io-client';
import MatchResult from './scenes/MatchResult';
import { useContext } from 'react';
import { SocketContext } from '../../../App';
//import ReplayPlayer from './scenes/ReplayPlayer';

export function launch_game(players_data: PlayersGameData, socket: Socket): void
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
			}
		  },
		scene: [ Lobby, Pong, MatchResult ]
	};
	const game = new Phaser.Game(config);
}

// export function watch_replay(game_id: string): void
// {
// 	const config = {
// 		type: Phaser.AUTO,
// 		scale: {
// 			mode: Phaser.Scale.FIT,
// 			autoCenter: Phaser.Scale.CENTER_BOTH,
// 			parent: 'game_anchor',
// 			width: 800,
// 			height: 600
// 		},
// 		parent: 'game_anchor',
// 		backgroundColor: '#FFFFFF',
// 		width: 800,
// 		height: 600,
// 		callbacks: {
// 			preBoot: function (game) {
// 				game.registry.set('game_id', game_id);
// 				game.registry.set('is_replay', true);
// 			}
// 		  },
// 		scene: [ ReplayPlayer, MatchResult ]
// 	};
// 	const game = new Phaser.Game(config);
// }
