import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { launch_game } from "./game/libpong";
import { PlayersGameData } from "./game/types/shared.types";
import { io } from "socket.io-client";
import { socketUrl } from "../../env";
import { CacheContext } from "../../App"
import { useContext } from 'react';
import { TokenStorageInterface } from "../../Types/Utils-Types";

function Game() {
    const [gameDatas, setGameDatas] = useState<PlayersGameData | undefined>(undefined);
    const location = useLocation();
    const navigate = useNavigate();
    const cache = useContext(CacheContext).cache;

    useEffect(() => {
        const localToken: string | null = localStorage.getItem("userToken");
        if (localToken !== null && location && location.state) {
            const localTokenParse: TokenStorageInterface = JSON.parse(localToken);
            const locationState = location.state as PlayersGameData;

            const gameSocket = io(`${socketUrl}/game`, {extraHeaders: {
                "Authorization": `Bearer ${localTokenParse.access_token}`,
            }});

            gameSocket.on("MultiTabError", () => {
                navigate("/");
            });
            
            gameSocket.on("Connected", () => {
                setGameDatas(locationState);
                    launch_game(locationState, gameSocket, localTokenParse.access_token, cache);
            })
        }
    }, [])

    return !gameDatas ? (
        <>
        
        </>
    ) : (
        <div>

        </div> 
    )
}

export default Game;