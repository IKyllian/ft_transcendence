// import { Game } from "phaser";
import 'phaser';
import Pong from '../scenes/Pong';
import Lobby from '../scenes/Lobby';
import MatchResult from '../scenes/MatchResult';

export function game_destroy(game: Phaser.Game)
{

    let lobby: Lobby | Phaser.Scene | undefined = game.scene.getScene('Lobby');
    let pong: Pong | Phaser.Scene | undefined = game.scene.getScene('Pong');
    let matchresult: MatchResult | Phaser.Scene | undefined = game.scene.getScene('MatchResult');

    if (lobby instanceof Lobby)
    {
        console.log("clearing lobby intervals");
        clearInterval(lobby.load_interval);
        clearInterval(lobby.update_interval);
        clearTimeout(lobby.error_timeout);
        clearTimeout(lobby.pongstart_timeout);
        clearTimeout(lobby.fadeout_timeout);
    }

    if (pong instanceof Pong)
    {
        console.log("clearing pong intervals");
        clearInterval(pong.update_interval);
        clearTimeout(pong.pong_timeout);
    }


    if (matchresult instanceof MatchResult)
    {
        clearTimeout(matchresult.close_timeout);
        matchresult.elo_timeouts.forEach((elem) => { clearTimeout(elem) });
        matchresult.elo_intervals.forEach((elem) => { clearInterval(elem) });
    }


    game.destroy(true, false);

}