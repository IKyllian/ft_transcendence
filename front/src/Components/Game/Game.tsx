import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { launch_game } from "./game/libpong";
import { PlayersGameData } from "./game/types/shared.types";
import { io, Socket } from "socket.io-client";
import { baseUrl, socketUrl } from "../../env";
import { CacheContext } from "../../App"
import { useContext } from 'react';
import { TokenStorageInterface } from "../../Types/Utils-Types";
import { useAppDispatch } from "../../Redux/Hooks";
import { unsetGameFound } from "../../Redux/PartySlice";
import axios from "axios";

function Game() {
    const [gameDatas, setGameDatas] = useState<PlayersGameData | undefined>(undefined);
    const [gameSocket, setGameSocket] = useState<Socket | undefined>(undefined);
    const [hasEnded, setHasEnded] = useState<boolean>(false);
    const location = useLocation();
    const navigate = useNavigate();
    const {cache} = useContext(CacheContext);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (hasEnded) {
            dispatch(unsetGameFound());
            navigate("/lobby");
        }
    }, [hasEnded])

    useEffect(() => {
        if (gameSocket) {
            const localToken: string | null = localStorage.getItem("userToken");
            if (localToken !== null) {
                const localTokenParse: TokenStorageInterface = JSON.parse(localToken);
                const locationState = location.state as PlayersGameData;
                gameSocket.on("MultiTabError", () => {
                    navigate("/");
                });
                
                gameSocket.on("Connected", () => {
                    console.log("CONNECTED");
                    setGameDatas(locationState);
                    launch_game(locationState, gameSocket, localTokenParse.access_token, cache, setHasEnded);
                })

                gameSocket.on("Unauthorized", async () => {
                    console.log("Unauthorized");
                    const localToken: string | null = localStorage.getItem("userToken");
                    if (localToken) {
                        const storedToken: TokenStorageInterface = JSON.parse(localToken);  
                        const refreshResponse = await axios.post(`${baseUrl}/auth/refresh`, {}, {
                            headers: {
                                "Authorization": `Bearer ${storedToken.refresh_token}`,
                            }
                        });
                        if (refreshResponse && refreshResponse.data) {
                            localStorage.setItem("userToken", JSON.stringify(refreshResponse.data));
                            const gameSocket: Socket = io(`${socketUrl}/game`, {extraHeaders: {
                                "Authorization": `Bearer ${refreshResponse.data.access_token}`,
                            }});
                            setGameSocket(gameSocket);
                        }
                    }
                })
            }
        }

        return () => {
            if (gameSocket) {
                console.log("DISCONEECT GAME SOCKET");
                gameSocket.off("MultiTabError");
                gameSocket.off("Connected");
                gameSocket.off("Unauthorized");
                gameSocket.off("Disconnect");
                gameSocket.disconnect();
            }
        }
    }, [gameSocket])

    useEffect(() => {
        const localToken: string | null = localStorage.getItem("userToken");
        if (localToken !== null && location && location.state) {
            const localTokenParse: TokenStorageInterface = JSON.parse(localToken);

            const gameSocket: Socket = io(`${socketUrl}/game`, {extraHeaders: {
                "Authorization": `Bearer ${localTokenParse.access_token}`,
            }});
            setGameSocket(gameSocket);
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