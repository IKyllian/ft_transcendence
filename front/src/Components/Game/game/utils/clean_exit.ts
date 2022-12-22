import { Game } from "phaser";

export function game_destroy(game: Game)
{
    console.log("juste avant destroy");
    game.destroy(true, false);
    console.log("juste apres");

}