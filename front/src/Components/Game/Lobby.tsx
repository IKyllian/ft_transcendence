import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SocketContext } from "../../App";
import { useAppSelector } from "../../Redux/Hooks";
import { UserInterface } from "../../Types/User-Types";
import { LobbyRequest } from "./game/types/shared.types";
import { PlayersGameData, NewGameData } from "./game/types/shared.types";
import Avatar from "../../Images-Icons/pp.jpg";
import { IconCheck, IconX, IconPlus, IconChevronUp, IconChevronDown } from "@tabler/icons";
import InvitedSpin from "../Utils/Invited-Spin";
import { GameModeState, GameMode, PartyInterface, GameUser } from "../../Types/Lobby-Types";
import { Controller, useForm } from "react-hook-form";
import ModalPartyInvite from "../Modal-Party-Invite";

const defaultGameModeState: GameModeState = {
    gameModes: [GameMode.RANKED, GameMode.PRIVATE_MATCH, GameMode.BONUS_2v2],
    indexSelected: 0,
}

function Lobby() {
    const {currentUser} = useAppSelector(state => state.auth)
    // const [lobbyUsers, setLobbyUsers] = useState<UserInterface[]>([currentUser!]);
    const [loggedUserIsLeader, setLoggedUserIsLeader] = useState<boolean>(false);
    const [showModal, setShowModal] = useState<boolean>(false);
    const { handleSubmit, control, watch } = useForm();
    const [gameMode, setGameMode] = useState<GameModeState>(defaultGameModeState);
    const {socket} = useContext(SocketContext);
    const location = useLocation();
    const navigate = useNavigate();
    const {party} = useAppSelector(state => state.party);

    useEffect(() => {
        if (!party || (party && party.players.find(elem => elem.isLeader && elem.user.id === currentUser!.id)))
            setLoggedUserIsLeader(true);
        else
            setLoggedUserIsLeader(false);
    }, [party])

    const onReady = (isReady: boolean) => {
        socket?.emit("SetReadyState", {
            isReady: isReady,
        });
    }

    const onGameModeChange = (index: number) => {
        setGameMode((prev: GameModeState) => {
            return { ...prev, indexSelected: index };
        });
    }

    const onCloseModal = () => {
        setShowModal(false);
    }

    const settingsFormSubmit = handleSubmit((data, e) => {
        e?.preventDefault();
        console.log("Data", data);
    })

    const startGame = () => {
        // if (lobbyUsers.length === 2) {
        //     const payload: LobbyRequest = {
        //         Player_A_Back: lobbyUsers[0].username,
        //         Player_A_Front: "",
        //         Player_B_Front: "",
        //         Player_B_Back: lobbyUsers[1].username,
        //         game_settings: {
        //             game_type: 0,
        //             up_down_border: 10,
        //             player_back_advance: 30,
        //             player_front_advance: 90,
        //             paddle_size_h: 500,
        //             paddle_speed: 15,
        //             ball_start_speed: 5,
        //             ball_acceleration: 1,
        //             point_for_victory: 3
        //         }
        //     }
        //     socket?.emit("admin_newgame", payload);
        // }
    }

    useEffect(() => {
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
            // setLobbyUsers(prev => [...prev, locationState]);
        }

        return () => {
            socket?.off("newgame_data");
        }
    }, [])
    return (
        <div className="lobby-container">
            <ModalPartyInvite show={showModal} onCloseModal={onCloseModal} />
            <div className="lobby-wrapper">
                <ul className="lobby-player-list">
                    {
                        party ? party.players.map((elem) => 
                            <PlayerListItem key={elem.user.id} user={elem} isInvited={false} />
                        )
                        : <PlayerListItem key={currentUser?.id} user={{isLeader: true, isReady: true, user: currentUser!}} isInvited={false} />
                    
                    }
                    {
                        Array.from({length:  !party ? 3 : 4 - party.players.length}, (elem, index) => 
                            <PlayerListItem key={index} isInvited={true} setShowModal={setShowModal} />
                        )
                    }
                </ul>
                <div className="lobby-settings">
                    <GameSettings hookForm={{handleSubmit: settingsFormSubmit, control: control, watch: watch}} />
                    <BoardGame hookForm={{watch: watch}} />
                </div>
                <LobbyButtonsContainer
                    gameMode={gameMode}
                    onGameModeChange={onGameModeChange}
                    user={!party ? {isLeader: true, isReady: true, user: currentUser!} : party?.players.find(elem => elem.user.id === currentUser!.id)}
                    onReady={onReady} />
            </div>
        </div>
    );
}

function BoardGame(props: {hookForm: {watch: any}}) {
    const { hookForm } = props;
    const paddleSize = hookForm.watch("paddleSize");
    
    useEffect(() => {
        const root = document.documentElement;
        root?.style.setProperty(
            "--paddleHeight",
            `${paddleSize}px`
          );
    }, [paddleSize])

    return (
        <div className="setting-wrapper board-game-wrapper">
            <div className="game-board">
                <div className="paddle"> </div>
                <div className="ball"> </div>
                <div className="paddle"> </div>
            </div>
        </div>
    );
}

function GameSettings(props: {hookForm: {handleSubmit: any, control: any, watch: any}}) {
    const { hookForm } = props;
    
    return (
        <div className=" setting-wrapper game-settings">
            <p> Settings </p>
            <form onSubmit={(e) => hookForm.handleSubmit(e)}>
                <div>
                    <Controller
                        control={hookForm.control}
                        name="paddleSize"
                        defaultValue={150}
                        render={({ field: { value, onChange }}) => (
                            <label>
                                Paddle Size
                                <input type="range" min={50} max={400} onChange={onChange} value={value} />
                            </label>
                            
                        )}
                    />
                </div>
                <button className="setting-submit" type="submit"> submit </button>
            </form>
        </div>
    );
}

function PlayerListItem(props: {user?: GameUser, isInvited?: boolean, setShowModal?: Function}) {
    const { user, isInvited, setShowModal } = props;

    return user ? (
        <li>
            <img className={`player-avatar ${isInvited ? "lobby-invited" : ""}`} src={Avatar} alt="profil pic" />
            <p> {user.user.username} </p>
            { user.isLeader && <span> Leader </span> }
            { !user.isLeader && user.isReady && <span> <IconCheck /> Ready </span> }
            { !user.isLeader && !user.isReady && <span> Not Ready </span> }
            {/* { isInvited && <span> <InvitedSpin /> Invited </span> } */}
        </li>
    ) : (
        <li className="empty-item">
            <IconPlus onClick={() => setShowModal!(true)} />
            <p> Invite Friend </p>
        </li>
    );
}

function LobbyButtonsContainer(props: {gameMode: GameModeState, onGameModeChange: Function, user: GameUser | undefined, onReady: Function }) {
    const { gameMode, onGameModeChange, user, onReady } = props;
    const [showDropdown, setShowDropdown] = useState<boolean>(false);
    console.log("user", user);
    return user ? (
        <div className="lobby-buttons-wrapper">
            <button> Invite Friends </button>
            { user.isLeader && <button> Start Game </button> }
            { !user.isLeader && user.isReady && <button onClick={() => onReady(false)}> Ready </button> }
            { !user.isLeader && !user.isReady && <button onClick={() => onReady(true)}> Not Ready </button> }
            <button className={`game-modes-button ${showDropdown ? "bos" : ""}`} onClick={() => setShowDropdown(!showDropdown)}>
                { gameMode.gameModes[gameMode.indexSelected] }
                { showDropdown && <IconChevronDown className="chevron-icon" /> }
                { !showDropdown && <IconChevronUp className="chevron-icon" /> }
                <DropdownGameModes show={showDropdown} gameMode={gameMode} onGameModeChange={onGameModeChange} />
            </button>
        </div>
    ) : (
        <> </>
    );
}

function DropdownGameModes(props: {show: boolean, gameMode: GameModeState, onGameModeChange: Function}) {
    const { show, gameMode, onGameModeChange } = props;
    return show ? (
        <div className="game-modes-dropdown">
            <ul>
                {
                    gameMode.gameModes.map((elem, index) =>
                        <li key={index} onClick={() => onGameModeChange(index)}> {elem} </li>
                    )
                }
            </ul>
        </div>
    ) : (
        <> </>
    );
}

export default Lobby;