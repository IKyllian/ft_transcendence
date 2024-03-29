import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SocketContext } from "../App";
import { useAppDispatch, useAppSelector } from "../Redux/Hooks";
import { GameMode, Player, GameType, TeamSide, PlayerPosition, GameSettings } from "../Types/Lobby-Types";
import { useForm } from "react-hook-form";
import { fetchIsAlreadyInGame } from "../Api/User-Fetch";
import { changeMode, lockModeDuo, lockModeQuatuor, unlockAll } from "../Redux/LobbySlice";

const defaultSettings: GameSettings = {
    game_type: GameType.Singles,
    up_down_border: 20,
    player_back_advance: 20,
    player_front_advance: 300,
    paddle_size_front: 70,
    paddle_size_back: 150,
    paddle_speed: 11,
    ball_start_speed: 5,
    ball_acceleration: 1,
    point_for_victory: 5,
}

export function useLobbyHook() {
    const {party, isInQueue, queueTimer} = useAppSelector(state => state.party);
    const [loggedUserIsLeader, setLoggedUserIsLeader] = useState<boolean>(false);
    const [lobbyError, setLobbyError] = useState<string | undefined>(undefined);
    const [multiTabCheck, setMultiTabCheck] = useState<boolean>(false);
    const { handleSubmit, control, watch, setValue, getValues, reset } = useForm<GameSettings>({defaultValues: !party ? defaultSettings : party.game_settings});

    const {currentUser} = useAppSelector(state => state.auth)
    const gameMode = useAppSelector(state => state.lobby);
    const {socket} = useContext(SocketContext);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const startCheck = () : void => {
        setLobbyError(undefined);
        if (party && !party.players.find(elem => elem.isLeader === false && elem.isReady === false)) {
            if (party.players.length === 1)
                return ;
            else if (party.players.length === 2) {
                if (party.game_mode == GameMode.RANKED_2v2) {
                    if (party.players[0].pos !== party.players[1].pos)
                        return ;
                    setLobbyError("Players are on the same position");
                    return ;
                }   
                if (party.game_mode == GameMode.PRIVATE_MATCH && party.players[0].team == party.players[1].team) {
                    setLobbyError("Players are on the same team");
                    return ;
                }
                return ;
            } else if (party.players.length === 4) {
                let team1Count: PlayerPosition[] = [];
                let team2Count: PlayerPosition[] = [];
                party.players.forEach(elem => {
                    if (elem.team === TeamSide.BLUE)
                        team1Count.push(elem.pos!);
                    else if (elem.team === TeamSide.RED)
                        team2Count.push(elem.pos!);
                })
                if (team1Count.length !== 2 || team2Count.length !== 2)
                    setLobbyError("Three or more players are on the same team");
                else if (team1Count[0] === team1Count[1] || team2Count[0] === team2Count[1])
                    setLobbyError("Players are on the same position");
                return ;
            }
            setLobbyError("Need 2 or 4 player to start the game");
            return ;
        } else if (!party)
            return ;
        setLobbyError("Player(s) not ready");
        return ;
    }

    const checkLobbyError = useMemo(() => {
        startCheck();
        if (!party || (party && party.players.find(elem => elem.isLeader && elem.user.id === currentUser!.id)))
            setLoggedUserIsLeader(true);
        else
            setLoggedUserIsLeader(false);
    }, [party]);

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
                socket?.emit("SetGameMode", gameMode);
            }
        } 
        dispatch(changeMode(index));
    }

    const settingsFormSubmit = handleSubmit((data: GameSettings, e) => {
        e?.preventDefault();
        const gameSettings: GameSettings = {...data};
        socket?.emit("SetSettings", gameSettings);
    })

    const onInputChange = (e: any, field: any) => {
        setValue(field, +e.target.value);
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
        let isRanked: boolean = true;
        if ((party && party.game_mode === GameMode.PRIVATE_MATCH) || (!party && gameMode.gameModes[gameMode.indexSelected].gameMode === GameMode.PRIVATE_MATCH))
            isRanked = false;
        socket?.emit("StartQueue", {
            gameType: selectGameMode(),
            isRanked: isRanked,
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

    const onChangePos = (e: any, player: Player) => {
        let newPos: number | undefined = undefined;
        if (e.target && e.target.value)
            newPos = +e.target.value
        if (newPos !== undefined && newPos !== player.pos) {
            socket?.emit("SetPlayerPos", {
                pos: newPos,
            })
        }
    }

    useEffect(() => {
        if (party && party.players.length > 1) {
            if (party.players.length > 2) {
                if (party.game_mode !== GameMode.PRIVATE_MATCH)
                    socket?.emit("SetGameMode", GameMode.PRIVATE_MATCH);
                dispatch(lockModeQuatuor());
            } else if (party.players.length === 2){
                if (party.game_mode === GameMode.RANKED)
                    socket?.emit("SetGameMode", GameMode.PRIVATE_MATCH);
                dispatch(lockModeDuo(party.game_mode === GameMode.RANKED ? 1 : gameMode.indexSelected));
            }          
        } else if ((party && party.players.length === 1) || !party) {
            dispatch(unlockAll());
        }
    }, [party?.players, socket])

    useEffect(() => {
        const checkGame = async () => {
            await fetchIsAlreadyInGame().then(result => { 
                if (result)
                    navigate("/");
                return result;
            });
            setMultiTabCheck(true);
        }
        if (multiTabCheck)
            checkGame();
    }, [multiTabCheck])

    return {
        currentUser,
        isInQueue,
        party,
        gameMode,
        loggedUserIsLeader,
        queueTimer,
        lockForm: gameMode.lockForm,
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
        lobbyError,
    }
}