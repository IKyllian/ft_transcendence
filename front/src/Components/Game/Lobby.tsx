import { useEffect } from "react";
import { useAppDispatch } from "../../Redux/Hooks";
import Avatar from "../../Images-Icons/pp.jpg";
import { IconCheck, IconPlus, IconChevronUp, IconChevronDown, IconLock } from "@tabler/icons";
import { GameModeState, GameMode, Player, TeamSide, PlayerPosition, GameSettings, PartyInterface } from "../../Types/Lobby-Types";
import { Controller, UseFormGetValues } from "react-hook-form";
import { changeModalStatus } from "../../Redux/PartySlice";
import { useLobbyHook } from "../../Hooks/Lobby-Hook";

function Lobby() {
    const {
        currentUser,
        isInQueue,
        party,
        gameMode,
        loggedUserIsLeader,
        showDropdown,
        partyReady,
        formHook,
        onInputChange,
        setShowDropdown,
        onReady,
        onGameModeChange,
        settingsFormSubmit,
        startQueue,
        cancelQueue,
        onChangeTeam,
        onChangePos,
    } = useLobbyHook();

    return !isInQueue ? (
        <div className="lobby-container">
            <div className="lobby-wrapper">
                <ul className="lobby-player-list">
                    {
                        party ? party.players.map((elem) => 
                            <PlayerListItem
                                key={elem.user.id}
                                user={elem}
                                lobbyLength={party.players.length}
                                gameMode={gameMode.gameModes[gameMode.indexSelected].gameMode}
                                onChangeTeam={onChangeTeam}
                                loggedUserId={currentUser?.id}
                                onChangePos={onChangePos} 
                            />
                        )
                        : <PlayerListItem key={currentUser?.id} user={{isLeader: true, isReady: true, user: currentUser!, team: TeamSide.BLUE}} lobbyLength={1} />
                    }
                    {
                        Array.from({length: !party ? 3 : 4 - party.players.length}, (elem, index) => 
                            <PlayerListItem key={index} />
                        )
                    }
                </ul>
                {
                    ((party && party.game_mode === GameMode.PRIVATE_MATCH) || (!party && gameMode.gameModes[gameMode.indexSelected].gameMode === GameMode.PRIVATE_MATCH)) &&
                    <div className="lobby-settings">
                        <GameSettingsWrapper hookForm={{handleSubmit: settingsFormSubmit, control: formHook.control, watch: formHook.watch, getValues: formHook.getValues}} onInputChange={onInputChange} loggedUserIsLeader={loggedUserIsLeader} />
                        <BoardGame hookForm={{watch: formHook.watch}} />
                    </div>
                }
                <LobbyButtonsContainer
                    party={party}
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
    const paddleSize = hookForm.watch("paddle_size_h");
    const playerBackAdvance = hookForm.watch("player_back_advance");
    const playerFrontAdvance = hookForm.watch("player_front_advance");


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
                <div className="paddle-wrapper left-wrapper">
                    <div className="paddle paddle-left paddle-back"> </div>
                    <div className="paddle paddle-left paddle-front"> </div>
                </div>
                <div className="ball"> </div>
                <div className="paddle-wrapper right-wrapper">
                    <div className="paddle paddle-right paddle-back"> </div>
                    <div className="paddle paddle-right paddle-front"> </div>
                </div>
            </div>
        </div>
    );
}

function GameSettingsWrapper(props: {hookForm: {handleSubmit: any, control: any, watch: any, getValues: UseFormGetValues<GameSettings>}, onInputChange: Function, loggedUserIsLeader:boolean}) {
    const { hookForm, onInputChange, loggedUserIsLeader } = props;

    return (
        <div className="setting-wrapper game-settings">            
            <p> Settings </p>
            { !loggedUserIsLeader && <IconLock className="lock-icon" /> }
            {
                loggedUserIsLeader && 
                <form onSubmit={(e) => hookForm.handleSubmit(e)}>
                    <Controller
                        control={hookForm.control}
                        name="paddle_size_h"
                        defaultValue={hookForm.getValues("paddle_size_h")}
                        render={({ field: { value }}) => (
                            <label>
                                Paddle Size
                                <input disabled={!loggedUserIsLeader} type="range" min={10} max={200} onChange={(e) => onInputChange(e, "paddle_size_h")} value={value} />
                            </label>
                            
                        )}
                    />
                    <Controller
                        control={hookForm.control}
                        name="player_back_advance"
                        defaultValue={hookForm.getValues().player_back_advance}
                        render={({ field: { value }}) => (
                            <label>
                                Player Back Advance
                                <input disabled={!loggedUserIsLeader} type="range" min={10} max={180} onChange={(e) => onInputChange(e, "player_back_advance")} value={value} />
                            </label>
                            
                        )}
                    />
                    <Controller
                        control={hookForm.control}
                        name="player_front_advance"
                        defaultValue={hookForm.getValues("player_front_advance")}
                        render={({ field: { value }}) => (
                            <label>
                                Player Front Advance
                                <input disabled={!loggedUserIsLeader} type="range" min={60} max={350} onChange={(e) => onInputChange(e, "player_front_advance")} value={value} />
                            </label>
                            
                        )}
                    />
                    <Controller
                        control={hookForm.control}
                        name="paddle_speed"
                        defaultValue={hookForm.getValues("paddle_speed")}
                        render={({ field: { value }}) => (
                            <label>
                                Paddle Speed
                                <input disabled={!loggedUserIsLeader} type="range" min={5} max={25} onChange={(e) => onInputChange(e, "paddle_speed")} value={value} />
                            </label>
                            
                        )}
                    />
                    <Controller
                        control={hookForm.control}
                        name="ball_start_speed"
                        defaultValue={hookForm.getValues("ball_start_speed")}
                        render={({ field: { value }}) => (
                            <label>
                                Ball Start Speed
                                <input disabled={!loggedUserIsLeader} type="range" min={5} max={25} onChange={(e) => onInputChange(e, "ball_start_speed")} value={value} />
                            </label>
                            
                        )}
                    />
                    <Controller
                        control={hookForm.control}
                        name="ball_acceleration"
                        defaultValue={hookForm.getValues("ball_acceleration")}
                        render={({ field: { value }}) => (
                            <label>
                                Ball Acceleration
                                <input disabled={!loggedUserIsLeader} type="range" min={0.5} max={3} onChange={(e) => onInputChange(e, "ball_acceleration")} value={value} />
                            </label>
                            
                        )}
                    />
                    <Controller
                        control={hookForm.control}
                        name="point_for_victory"
                        defaultValue={hookForm.getValues("point_for_victory")}
                        render={({ field: { value }}) => (
                            <label>
                                Point For Victory
                                <input disabled={!loggedUserIsLeader} type="range" min={1} max={10} onChange={(e) => onInputChange(e, "point_for_victory")} value={value} />
                            </label>
                            
                        )}
                    />
                    <button className="setting-submit" type="submit"> Submit </button>
                </form>
            }
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

function PlayerListItem(props: {user?: Player, lobbyLength?: number, gameMode?: GameMode, onChangeTeam?: Function, loggedUserId?: number, onChangePos?: Function}) {
    const { user, lobbyLength, gameMode, onChangeTeam, loggedUserId, onChangePos } = props;
    const dispatch = useAppDispatch();
    const displayTeam: boolean = lobbyLength && (gameMode === GameMode.PRIVATE_MATCH || lobbyLength > 2) ? true : false;
    const displaySelectPos: boolean = (lobbyLength && (gameMode === GameMode.PRIVATE_MATCH && lobbyLength > 2) || (gameMode === GameMode.RANKED_2v2 && lobbyLength == 2));

    return user ? (
        <li className={`${displayTeam ? `team-${user.team === TeamSide.BLUE ? "blue" : "red" }` : ""}`} >
            { displayTeam && onChangeTeam && loggedUserId === user.user.id && <TeamCircles user={user} onChangeTeam={onChangeTeam} /> }
            <img className={`player-avatar ${displayTeam ? "avatar-shadow" : ""}`} src={Avatar} alt="profil pic" />
            <p> {user.user.username} </p>
            {
                user.user.id === loggedUserId && lobbyLength && onChangePos && displaySelectPos &&
                <select onChange={(e) => onChangePos(e, user)} value={user.pos === PlayerPosition.BACK ? PlayerPosition.BACK : PlayerPosition.FRONT} className="team-select">
                    <option value={PlayerPosition.BACK} > Paddle Back </option>
                    <option value={PlayerPosition.FRONT} > Paddle Front </option>
                </select>
            }
            {
                user.user.id !== loggedUserId && lobbyLength && displaySelectPos &&
                <p className="player-pos"> {user.pos === PlayerPosition.BACK ? "Paddle Back" : "Paddle Front"} </p>
            }
            { user.isLeader && <span style={{marginTop: `${!displaySelectPos || (displaySelectPos && loggedUserId !== user.user.id) ? "10px" : "6px"}`}}> Leader </span> }
            { !user.isLeader && user.isReady && <span style={{marginTop: `${!displaySelectPos || (displaySelectPos && loggedUserId !== user.user.id) ? "10px" : "6px"}`}}> <IconCheck /> Ready </span> }
            { !user.isLeader && !user.isReady && <span style={{marginTop: `${!displaySelectPos || (displaySelectPos && loggedUserId !== user.user.id) ? "10px" : "6px"}`}}> Not Ready </span> }
        </li>
    ) : (
        <li className="empty-item">
            <IconPlus onClick={() => dispatch(changeModalStatus(true))} />
            <p> Invite Friend </p>
        </li>
    );
}

function LobbyButtonsContainer(props: {party: PartyInterface | undefined, gameMode: GameModeState, onGameModeChange: Function, user: Player | undefined, onReady: Function, showDropdown: boolean, setShowDropdown: Function, partyReady: boolean, loggedUserIsLeader: boolean, startQueue: Function }) {
    const { party, gameMode, onGameModeChange, user, onReady, showDropdown, setShowDropdown, partyReady, loggedUserIsLeader, startQueue } = props;
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
                { !party && gameMode.gameModes[gameMode.indexSelected].gameMode }
                { party && party.game_mode }
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
                            return <li key={index} onClick={() => onGameModeChange(index, elem.gameMode)}> {elem.gameMode} </li>
                    })
                }
            </ul>
        </div>
    ) : (
        <> </>
    );
}

export default Lobby;