import { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { SocketContext } from "../../App";
import { launch_game, admin_new_game } from "./game/libpong";
import { PlayersGameData } from "./game/types/shared.types";

function Game() {
    const [gameDatas, setGameDatas] = useState<PlayersGameData | undefined>(undefined);
    const location = useLocation();
    const {socket} = useContext(SocketContext);

    useEffect(() => {
        if (location && location.state) {
            const locationState = location.state as PlayersGameData;
            setGameDatas(locationState);
            launch_game(locationState, socket!);
        }
    }, [])

    return !gameDatas ? (
        <>
        
        </>
    ) : (
        <div id="game_anchor">

        </div> 
    )
}

export default Game;