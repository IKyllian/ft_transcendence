import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SocketContext } from "../App";
import { useAppDispatch, useAppSelector } from "../Redux/Hooks";
import { PlayersGameData } from "../Components/Game/game/types/shared.types";
import { GameModeState, GameMode, Player, GameType, TeamSide, PlayerPosition, GameSettings } from "../Types/Lobby-Types";
import { useForm } from "react-hook-form";
import { changeQueueStatus, newGameFound } from "../Redux/PartySlice";
import { partyIsReady } from "../Utils/Utils-Party";
import { fetchIsAlreadyInGame } from "../Api/Lobby";

const defaultGameModeState: GameModeState = {
    gameModes: [
        {
            gameMode: GameMode.RANKED,
            isLock: false,   
        },  {
            gameMode: GameMode.PRIVATE_MATCH,
            isLock: false,   
        }, {
            gameMode: GameMode.RANKED_2v2,
            isLock: false,   
        }
    ],
    indexSelected: 0,
}

const defaultSettings: GameSettings = {
    game_type: GameType.Singles,
    up_down_border: 20, 
    player_back_advance: 20,
    player_front_advance: 60,
    paddle_size_h: 150, 
    paddle_speed: 13,
    ball_start_speed: 5,
    ball_acceleration: 1,
    point_for_victory: 2,
}

export function useLobbyHook() {
    const {party, isInQueue, queueTimer} = useAppSelector(state => state.party);
    const {currentUser, token} = useAppSelector(state => state.auth)
    const [loggedUserIsLeader, setLoggedUserIsLeader] = useState<boolean>(false);
    const { handleSubmit, control, watch, setValue, getValues, reset } = useForm<GameSettings>({defaultValues: !party ? defaultSettings : party.game_settings});
    const [gameMode, setGameMode] = useState<GameModeState>(defaultGameModeState);
    const {socket} = useContext(SocketContext);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const partyReady: boolean = (!party || (party && partyIsReady(party?.players))) ? true : false; 
    
    useEffect(() => {
        if (!party || (party && party.players.find(elem => elem.isLeader && elem.user.id === currentUser!.id)))
            setLoggedUserIsLeader(true);
        else
            setLoggedUserIsLeader(false);
    }, [party])

    useEffect(() => {
        if (party)
            reset(party.game_settings);
    }, [party?.game_settings])

    const onReady = (isReady: boolean) => {
        socket?.emit("SetReadyState", {
            isReady: isReady,
        });
    }

    const onGameModeChange = (index: number, gameMode: GameMode) => {
        if (party) {
            if (gameMode !== party.game_mode) {
                console.log("EMIT");
                socket?.emit("SetGameMode", gameMode);
            }
        } else {
            setGameMode((prev: GameModeState) => {
                return { ...prev, indexSelected: index };
            });
        }
    }

    const settingsFormSubmit = handleSubmit((data: GameSettings, e) => {
        e?.preventDefault();
        const gameSettings: GameSettings = {...data};
        socket?.emit("SetSettings", gameSettings);
    })

    const onInputChange = (e: any, field: any) => {
        setValue(field, parseInt(e.target.value));
    }

    const startCheck = () : boolean => {
        if (party && !party.players.find(elem => elem.isLeader === false && elem.isReady === false)) {
            if (party.players.length === 1)
                return true;
            else if (party.players.length === 2) {
                if (party.game_mode == GameMode.RANKED_2v2)
                    return true;
                if (party.game_mode == GameMode.PRIVATE_MATCH && party.players[0].team !== party.players[1].team)
                    return true;
            } else if (party.players.length === 4) {
                let team1Count: PlayerPosition[] = [];
                let team2Count: PlayerPosition[] = [];
                party.players.forEach(elem => {
                    if (elem.team === TeamSide.BLUE)
                        team1Count.push(elem.pos!);
                    else if (elem.team === TeamSide.RED)
                        team2Count.push(elem.pos!);
                })
                if (team1Count.length === 2 && team2Count.length === 2
                    && team1Count[0] !== team1Count[1]
                    && team2Count[0] !== team2Count[1]) {
                        return true;
                }
            }
            return false
        } else if (!party)
            return true;
        return false;
    }

    const selectGameMode = (): GameType => {      
        if ((party && party.game_mode === GameMode.RANKED_2v2) || (!party && gameMode.gameModes[gameMode.indexSelected].gameMode === GameMode.RANKED_2v2))
            return GameType.Doubles;
        else if (party && party.game_mode === GameMode.PRIVATE_MATCH) {
            if (party.players.length === 2)
                return GameType.Singles;
            else
                return GameType.Doubles;
        }
        return GameType.Singles;
    }

    const startQueue = () => {
        if (startCheck()) {
            let isRanked: boolean = true;
            if ((party && party.game_mode === GameMode.PRIVATE_MATCH) || (!party && gameMode.gameModes[gameMode.indexSelected].gameMode === GameMode.PRIVATE_MATCH))
                isRanked = false;
            console.log("isRanked", isRanked);
            console.log("selectGameMode", selectGameMode());
            socket?.emit("StartQueue", {
                gameType: selectGameMode(),
                isRanked: isRanked,
            });
        }
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

    const onChangePos = (e: any, player: Player) => {
        let newPos: number | undefined = undefined;
        if (e.target && e.target.value)
            newPos = parseInt(e.target.value)
        if (newPos !== undefined && newPos !== player.pos) {
            socket?.emit("SetPlayerPos", {
                pos: newPos,
            })
        }
    }

    useEffect(() => {
        if (party && party.players.length > 1) {
            if (party.players.length > 2) {
                setGameMode((prev: any) => {
                    socket?.emit("SetGameMode", GameMode.PRIVATE_MATCH);
                    return {...prev, indexSelected: 1, gameModes: [...gameMode.gameModes.map(elem => {
                        if (elem.gameMode === GameMode.RANKED)
                            return  {...elem, isLock: true };
                        else if (elem.gameMode === GameMode.RANKED_2v2)
                            return {...elem, isLock: true };
                        return elem;
                    })]}
                });
            } else if (party.players.length === 2){
                setGameMode((prev: any) => {
                    if (party.game_mode === GameMode.RANKED)
                        socket?.emit("SetGameMode", GameMode.PRIVATE_MATCH);
                    return {...prev, indexSelected: party.game_mode === GameMode.RANKED ? 1 : gameMode.indexSelected ,gameModes: [...gameMode.gameModes.map(elem => {
                        if (elem.gameMode === GameMode.RANKED)
                            return  {...elem, isLock: true };
                        else if (elem.gameMode === GameMode.RANKED_2v2)
                            return  {...elem, isLock: false };
                        return elem;
                    })]}
                });
            }          
        } else if ((party && party.players.length === 1) || !party) {
            setGameMode((prev: any) => {
                return {...prev, gameModes: [...gameMode.gameModes.map(elem => {
                    if (elem.isLock)
                        return  {...elem, isLock: false };
                    return elem;
                })]}
            });
        }
    }, [party?.players])

    useEffect(() => {
        const checkGame = async () => {
            await fetchIsAlreadyInGame(token).then(result => { 
                if (!result) {
                    socket?.on("newgame_data", (data: PlayersGameData) => {
                        console.log("new_game_data", data);
                        dispatch(changeQueueStatus(false));
                        dispatch(newGameFound(data));
                        // navigate("/game", {state: data});
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

    return {
        currentUser,
        isInQueue,
        party,
        gameMode,
        loggedUserIsLeader,
        partyReady,
        queueTimer,
        formHook : {
            watch,
            control,
            setValue,
            getValues,
        },
        onInputChange,
        onReady,
        onGameModeChange,
        settingsFormSubmit,
        startQueue,
        cancelQueue,
        onChangeTeam,
        onChangePos,
    }
}