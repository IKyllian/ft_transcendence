import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SocketContext } from "../App";
import { useAppDispatch, useAppSelector } from "../Redux/Hooks";
import { PlayersGameData } from "../Components/Game/game/types/shared.types";
import { GameModeState, GameMode, Player, GameType, TeamSide, PlayerPosition } from "../Types/Lobby-Types";
import { useForm } from "react-hook-form";
import { changeQueueStatus } from "../Redux/PartySlice";
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
            gameMode: GameMode.BONUS_2v2,
            isLock: false,   
        }
    ],
    indexSelected: 0,
}

export function useLobbyHook() {
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

    const startCheck = () : boolean => {
        if (party && !party.players.find(elem => elem.isLeader === false && elem.isReady === false)) {
            if (party.players.length === 1)
                return true;
            else if (party.players.length === 2) {
                if (party.players[0].team !== party.players[1].team)
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
        if (gameMode.gameModes[gameMode.indexSelected].gameMode === GameMode.BONUS_2v2)
            return GameType.Doubles;
        else if (gameMode.gameModes[gameMode.indexSelected].gameMode === GameMode.PRIVATE_MATCH) {
            if (party && party.players.length === 2)
                return GameType.Singles;
            else
                return GameType.Doubles;
        }
        return GameType.Singles;
    }

    const startQueue = () => {
        console.log("selectGameMode", selectGameMode());
        if (startCheck()) {
            socket?.emit("StartQueue", {
                gameType: selectGameMode(),
                isRanked: gameMode.gameModes[gameMode.indexSelected].gameMode === GameMode.RANKED ? true : false,
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

    return {
        currentUser,
        isInQueue,
        party,
        gameMode,
        loggedUserIsLeader,
        showDropdown,
        partyReady,
        formHook : {
            watch,
            control
        },
        setShowDropdown,
        onReady,
        onGameModeChange,
        settingsFormSubmit,
        startQueue,
        cancelQueue,
        onChangeTeam,
        onChangePos,
    }
}