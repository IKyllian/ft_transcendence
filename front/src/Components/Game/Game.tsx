import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { launch_game } from "./game/libpong";
import { PlayersGameData } from "./game/types/shared.types";
import { useAppSelector } from "../../Redux/Hooks";
import { io } from "socket.io-client";
import { socketUrl } from "../../env";

function Game() {
    const [gameDatas, setGameDatas] = useState<PlayersGameData | undefined>(undefined);
    const location = useLocation();
    const navigate = useNavigate();
    const {token} = useAppSelector(state => state.auth);

    useEffect(() => {
        if (location && location.state) {
            const locationState = location.state as PlayersGameData;
            console.log("locationState", locationState);
            const gameSocket = io(`${socketUrl}/game`, {extraHeaders: {
                "Authorization": `Bearer ${token}`,
            }});
            console.log("gameSocket", gameSocket);
            gameSocket.on("MultiTabError", () => {
                navigate("/");
            });
            gameSocket.on("Connected", () => {
                setGameDatas(locationState);
                    launch_game(locationState, gameSocket);
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