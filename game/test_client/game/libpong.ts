import 'phaser';
import Pong from './scenes/Pong';
import Lobby from './scenes/Lobby';
import { PlayersGameData } from './types/shared.types';
import { io, Socket } from 'socket.io-client';
import MatchResult from './scenes/MatchResult';
import ReplayPlayer from './scenes/ReplayPlayer';


export function admin_new_game(player_A: string, player_B: string): void
{
	const sock: Socket = io('http://localhost:6161');

	sock.emit('admin_authenticate', 'praclarushtaonas');

	console.log('requesting new game for', player_A, player_B);
	sock.emit('admin_newgame', {player_A: player_A, player_B: player_B});

}

export function launch_game(players_data: PlayersGameData): void
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
			preBoot: function (game) {
				game.registry.set('players_data', players_data);
			}
		  },
		scene: [ Lobby, Pong, MatchResult ]
	};
	const game = new Phaser.Game(config);
}

export function watch_replay(game_id: string): void
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
			preBoot: function (game) {
				game.registry.set('game_id', game_id);
			}
		  },
		scene: [ ReplayPlayer ]
	};
	const game = new Phaser.Game(config);
}
