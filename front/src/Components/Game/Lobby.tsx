import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SocketContext } from "../../App";
import { useAppDispatch, useAppSelector } from "../../Redux/Hooks";
import { PlayersGameData } from "./game/types/shared.types";
import Avatar from "../../Images-Icons/pp.jpg";
import { IconCheck, IconPlus, IconChevronUp, IconChevronDown, IconLock } from "@tabler/icons";
import { GameModeState, GameMode, Player, GameType, TeamSide } from "../../Types/Lobby-Types";
import { Controller, useForm } from "react-hook-form";
import { changeModalStatus, changeQueueStatus } from "../../Redux/PartySlice";
import { partyIsReady } from "../../Utils/Utils-Party";
import { fetchIsAlreadyInGame } from "../../Api/Lobby";

const defaultGameModeState: GameModeState = {
    gameModes: [
        {
            gameMode: GameMode.RANKED,
            isLock: false,   
        },  {
            gameMode: GameMode.PRIVATE_MATCH,
            isLock: false,   
        }, {
            gameMode: GameMode.BONUS_2v2,
            isLock: false,   
        }
    ],
    indexSelected: 0,
}

function Lobby() {
    const {currentUser, token} = useAppSelector(state => state.auth)
    const [loggedUserIsLeader, setLoggedUserIsLeader] = useState<boolean>(false);
    const { handleSubmit, control, watch } = useForm();
    const [gameMode, setGameMode] = useState<GameModeState>(defaultGameModeState);
    const [showDropdown, setShowDropdown] = useState<boolean>(false);
    const {socket} = useContext(SocketContext);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const {party, isInQueue} = useAppSelector(state => state.party);
    const partyReady: boolean = (!party || (party && partyIsReady(party?.players))) ? true : false;

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
        setShowDropdown(false);
    }

    const settingsFormSubmit = handleSubmit((data, e) => {
        e?.preventDefault();
        console.log("Data", data);
    })

    const startQueue = () => {
        socket?.emit("StartQueue", {
            gameType: GameType.Singles,
        });
    }

    const cancelQueue = () => {
        socket?.emit("StopQueue");
    }

    const onChangeTeam = (teamSide: TeamSide, player: Player) => {
        if (player.team !== teamSide) {
            socket?.emit("SetTeamSide", {
                team: teamSide,
            });
        }
    }

    useEffect(() => {
        if (party && party.players.length > 1) {
            if (party.players.length > 2) {
                setGameMode((prev: any) => {
                    return {...prev, indexSelected: 1, gameModes: [...gameMode.gameModes.map(elem => {
                        if (elem.gameMode === GameMode.RANKED)
                            return  {...elem, isLock: true };
                        else if (elem.gameMode === GameMode.BONUS_2v2)
                            return {...elem, isLock: true };
                        return elem;
                    })]}
                });
            } else if (party.players.length === 2){
                setGameMode((prev: any) => {
                    return {...prev, indexSelected: gameMode.indexSelected === 0 ? 1 : gameMode.indexSelected ,gameModes: [...gameMode.gameModes.map(elem => {
                        if (elem.gameMode === GameMode.RANKED)
                            return  {...elem, isLock: true };
                        else if (elem.gameMode === GameMode.BONUS_2v2)
                            return  {...elem, isLock: false };
                        return elem;
                    })]}
                });
            }          
        } else if (party && party.players.length === 1) {
            setGameMode((prev: any) => {
                return {...prev, gameModes: [...gameMode.gameModes.map(elem => {
                    if (elem.isLock)
                        return  {...elem, isLock: false };
                    return elem;
                })]}
            });
        }
    }, [party])

    useEffect(() => {
        const checkGame = async () => {
            await fetchIsAlreadyInGame(token).then(result => { 
                if (!result) {
                    socket?.on("newgame_data", (data: PlayersGameData) => {
                        console.log("new_game_data", data);
                        dispatch(changeQueueStatus(false));
                        navigate("/game", {state: data});
                    });
                } else
                    navigate("/");
                return result
            });
        }
        checkGame();     
        return () => {
            socket?.off("newgame_data");
        }
    }, [])
    return !isInQueue ? (
        <div className="lobby-container">
            <div className="lobby-wrapper">
                <ul className="lobby-player-list">
                    {
                        party ? party.players.map((elem) => 
                            <PlayerListItem key={elem.user.id} user={elem} lobbyLength={party.players.length} gameMode={gameMode.gameModes[gameMode.indexSelected].gameMode} onChangeTeam={onChangeTeam} loggedUserId={currentUser?.id} />
                        )
                        : <PlayerListItem key={currentUser?.id} user={{isLeader: true, isReady: true, user: currentUser!, team: TeamSide.BLUE}} lobbyLength={1} />
                    }
                    {
                        Array.from({length:  !party ? 3 : 4 - party.players.length}, (elem, index) => 
                            <PlayerListItem key={index} />
                        )
                    }
                </ul>
                {
                    gameMode.gameModes[gameMode.indexSelected].gameMode === GameMode.PRIVATE_MATCH &&
                    <div className="lobby-settings">
                        <GameSettings hookForm={{handleSubmit: settingsFormSubmit, control: control, watch: watch}} />
                        <BoardGame hookForm={{watch: watch}} />
                    </div>
                }
                <LobbyButtonsContainer
                    gameMode={gameMode}
                    onGameModeChange={onGameModeChange}
                    user={!party ? {isLeader: true, isReady: true, user: currentUser!, team: TeamSide.BLUE} : party?.players.find(elem => elem.user.id === currentUser!.id)}
                    onReady={onReady}
                    showDropdown={showDropdown}
                    setShowDropdown={setShowDropdown}
                    partyReady={partyReady}
                    loggedUserIsLeader={loggedUserIsLeader}
                    startQueue={startQueue}
                />
            </div>
        </div>
    ) : (
        <div className="lobby-container">
            <h4> In Queue... </h4>
            <button onClick={() => cancelQueue()}> Stop Queue </button>
        </div>
    );
}

function BoardGame(props: {hookForm: {watch: any}}) {
    const { hookForm } = props;
    const paddleSize = hookForm.watch("paddleSize");
    const playerBackAdvance = hookForm.watch("playerBackAdvance");
    const playerFrontAdvance = hookForm.watch("playerFrontAdvance");


    console.log("paddleSize", paddleSize);
    console.log("playerBackAdvance", playerBackAdvance);
    console.log("playerFrontAdvance", playerFrontAdvance);
    
    useEffect(() => {
        const root = document.documentElement;
        root?.style.setProperty(
            "--PaddleHeight",
            `${paddleSize}px`
        );

        root?.style.setProperty(
            "--PlayerBackAdvance",
            `${playerBackAdvance}px`
        );

        root?.style.setProperty(
            "--PlayerFrontAdvance",
            `${playerFrontAdvance}px`
        );
    }, [paddleSize, playerBackAdvance, playerFrontAdvance])

    return (
        <div className="setting-wrapper board-game-wrapper">
            <div className="game-board">
                <div className="paddle-wrapper">
                    <div className="paddle paddle-left"> </div>
                    <div className="paddle paddle-left"> </div>
                </div>
                <div className="ball"> </div>
                <div className="paddle-wrapper">
                    <div className="paddle paddle-right"> </div>
                    <div className="paddle paddle-right"> </div>
                </div>
            </div>
        </div>
    );
}

function GameSettings(props: {hookForm: {handleSubmit: any, control: any, watch: any}}) {
    const { hookForm } = props;
    
    return (
        <div className="setting-wrapper game-settings">
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
                                <input type="range" min={50} max={300} onChange={onChange} value={value} />
                            </label>
                            
                        )}
                    />
                    <Controller
                        control={hookForm.control}
                        name="playerBackAdvance"
                        defaultValue={10}
                        render={({ field: { value, onChange }}) => (
                            <label>
                                Player Back Advance
                                <input type="range" min={10} max={100} onChange={onChange} value={value} />
                            </label>
                            
                        )}
                    />
                    <Controller
                        control={hookForm.control}
                        name="playerFrontAdvance"
                        defaultValue={40}
                        render={({ field: { value, onChange }}) => (
                            <label>
                                Player Front Advance
                                <input type="range" min={40} max={150} onChange={onChange} value={value} />
                            </label>
                            
                        )}
                    />
                </div>
                <button className="setting-submit" type="submit"> submit </button>
            </form>
        </div>
    );
}

function TeamCircles(props: {user: Player, onChangeTeam: Function}) {
    const {user, onChangeTeam} = props;
    return (
        <div className="teams-wrapper">
            <div className={`circle-item team1 ${user.team === TeamSide.BLUE ? "team-active" : ""}`} onClick={() => onChangeTeam(TeamSide.BLUE, user.user.id)}> </div>
            <div className={`circle-item team2 ${user.team === TeamSide.RED ? "team-active" : ""}`} onClick={() => onChangeTeam(TeamSide.RED, user.user.id)}> </div>
        </div>
    );
}

function PlayerListItem(props: {user?: Player, lobbyLength?: number, gameMode?: GameMode, onChangeTeam?: Function, loggedUserId?: number}) {
    const { user, lobbyLength, gameMode, onChangeTeam, loggedUserId } = props;
    const dispatch = useAppDispatch();
    const displayTeam: boolean = lobbyLength && (gameMode === GameMode.PRIVATE_MATCH || lobbyLength > 2) ? true : false;

    return user ? (
        <li className={`${displayTeam ? `team-${user.team === TeamSide.BLUE ? "blue" : "red" }` : ""}`} >
            { displayTeam && onChangeTeam && loggedUserId === user.user.id && <TeamCircles user={user} onChangeTeam={onChangeTeam} /> }
            <img className={`player-avatar ${displayTeam ? "avatar-shadow" : ""}`} src={Avatar} alt="profil pic" />
            <p> {user.user.username} </p>
            {
                lobbyLength && lobbyLength > 1 && 
                <select className="team-select">
                    <option value="back"> Paddle Back </option>
                    <option value="front"> Paddle Front </option>
                </select>
            }
            { user.isLeader && <span> Leader </span> }
            { !user.isLeader && user.isReady && <span> <IconCheck /> Ready </span> }
            { !user.isLeader && !user.isReady && <span> Not Ready </span> }
        </li>
    ) : (
        <li className="empty-item">
            <IconPlus onClick={() => dispatch(changeModalStatus(true))} />
            <p> Invite Friend </p>
        </li>
    );
}

function LobbyButtonsContainer(props: {gameMode: GameModeState, onGameModeChange: Function, user: Player | undefined, onReady: Function, showDropdown: boolean, setShowDropdown: Function, partyReady: boolean, loggedUserIsLeader: boolean, startQueue: Function }) {
    const { gameMode, onGameModeChange, user, onReady, showDropdown, setShowDropdown, partyReady, loggedUserIsLeader, startQueue } = props;
    const gameModeOnclick = () => {
        if (loggedUserIsLeader)
            setShowDropdown(!showDropdown)
    }
    return user ? (
        <div className="lobby-buttons-wrapper">
            <button style={{cursor: "pointer"}}> Party Chat </button>
            { user.isLeader && partyReady && <button className="start-button" onClick={() => startQueue()}> Start Game </button> }
            { user.isLeader && !partyReady && <button> Waiting for players </button> }
            { !user.isLeader && user.isReady && <button className="start-button" onClick={() => onReady(false)}> Not Ready </button> }
            { !user.isLeader && !user.isReady && <button className="start-button" onClick={() => onReady(true)}> Ready </button> }
            <button style={loggedUserIsLeader ? {cursor: "pointer"} : {}} className={`game-modes-button ${showDropdown ? "bos" : ""}`} onClick={() => gameModeOnclick()}>
                { gameMode.gameModes[gameMode.indexSelected].gameMode }
                { showDropdown && loggedUserIsLeader && <IconChevronDown className="chevron-icon" /> }
                { !showDropdown && loggedUserIsLeader && <IconChevronUp className="chevron-icon" /> }
            </button>
            { loggedUserIsLeader && <DropdownGameModes show={showDropdown} gameMode={gameMode} onGameModeChange={onGameModeChange} /> }
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
                    gameMode.gameModes.map((elem, index) => {
                        if (elem.isLock)
                            return <li className="gameMode-lock" key={index}> <IconLock className="lock-icon" /> {elem.gameMode} </li>
                        else
                            return <li key={index} onClick={() => onGameModeChange(index)}> {elem.gameMode} </li>
                    })
                }
            </ul>
        </div>
    ) : (
        <> </>
    );
}

export default Lobby;