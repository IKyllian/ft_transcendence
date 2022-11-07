import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SocketContext } from "../../App";
import { useAppSelector } from "../../Redux/Hooks";
import { UserInterface } from "../../Types/User-Types";
import { LobbyRequest } from "./game/types/shared.types";
import { PlayersGameData, NewGameData } from "./game/types/shared.types";

function Lobby() {
    const {currentUser} = useAppSelector(state => state.auth)
    const [lobbyUsers, setLobbyUsers] = useState<UserInterface[]>([currentUser!]);
    const {socket} = useContext(SocketContext);
    const location = useLocation();
    const navigate = useNavigate();

    const startGame = () => {
        if (lobbyUsers.length === 2) {
            const payload: LobbyRequest = {
                Player_A_Back: lobbyUsers[0].username,
                Player_A_Front: "",
                Player_B_Front: "",
                Player_B_Back: lobbyUsers[1].username,
                game_settings: {
                    game_type: 0,
                    up_down_border: 10,
                    player_back_advance: 30,
                    player_front_advance: 90,
                    paddle_size_h: 500,
                    paddle_speed: 15,
                    ball_start_speed: 5,
                    ball_acceleration: 1,
                    point_for_victory: 3
                }
            }
            socket?.emit("admin_newgame", payload);
        }
    }

    useEffect(() => {
        socket?.on("JoinLobby", (data) => {
            console.log("JoinLobby", data);
            setLobbyUsers(prev => [...prev, data]);
        });

        socket?.on("newgame_data", (data: NewGameData) => {
            console.log("new_game_data", data);
            let newOject: PlayersGameData | undefined = undefined;
            if (data.Player_A_Back === currentUser?.username) {
                    newOject = {
                        Player_A_Back: {
                            name: data.Player_A_Back,
                            win: 0,
                            loss: 0,
                            avatar: 'avatars/mario.png'
                        },
                        Player_A_Front:
                        {
                            name: '',
                            win: 0,
                            loss: 0,
                            avatar: ''
                        },
                        Player_B_Front:
                        {
                            name: '',
                            win: 0,
                            loss: 0,
                            avatar: ''
                        },
                        Player_B_Back:
                        {
                            name: data.Player_B_Back,
                            win: 0,
                            loss: 0,
                            avatar: 'avatars/luigi.jpeg'
                        },
                        player_type: 0,
                        player_secret: data.Player_A_Back_secret,
                        game_id: data.game_id,
                        game_settings: data.game_settings,
                    }           
            } else {
                newOject = {
                    Player_A_Back: {
                        name: data.Player_A_Back,
                        win: 0,
                        loss: 0,
                        avatar: 'avatars/mario.png'
                    },
                    Player_A_Front:
                    {
                        name: '',
                        win: 0,
                        loss: 0,
                        avatar: ''
                    },
                    Player_B_Front:
                    {
                        name: '',
                        win: 0,
                        loss: 0,
                        avatar: ''
                    },
                    Player_B_Back:
                    {
                        name: data.Player_B_Back,
                        win: 0,
                        loss: 0,
                        avatar: 'avatars/luigi.jpeg'
                    },
                    player_type: 0,
                    player_secret: data.Player_B_Back_secret,
                    game_id: data.game_id,
                    game_settings: data.game_settings,
                }
            }   
            navigate("/game", {state: newOject});
        });

        if (location && location.state) {
            const locationState = location.state as UserInterface;
            setLobbyUsers(prev => [...prev, locationState]);
        }

        return () => {
            socket?.off("JoinLobby");
            socket?.off("newgame_data");
        }
    }, [])
    return (
        <div className="lobby-container">
            <h5> Lobby Users </h5>
            <ul>
                {
                    lobbyUsers.map((elem) => 
                        <li key={elem.id}> {elem.username} </li>
                    )
                }
            </ul>
            <button onClick={() => startGame()}> Play Game </button>
        </div>
    );
}

export default Lobby;