import { useEffect } from "react";
import { useAppDispatch } from "../../Redux/Hooks";
import Avatar from "../../Images-Icons/pp.jpg";
import { IconCheck, IconPlus, IconChevronUp, IconChevronDown, IconLock } from "@tabler/icons";
import { GameModeState, GameMode, Player, TeamSide, PlayerPosition } from "../../Types/Lobby-Types";
import { Controller } from "react-hook-form";
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
                        Array.from({length:  !party ? 3 : 4 - party.players.length}, (elem, index) => 
                            <PlayerListItem key={index} />
                        )
                    }
                </ul>
                {
                    gameMode.gameModes[gameMode.indexSelected].gameMode === GameMode.PRIVATE_MATCH &&
                    <div className="lobby-settings">
                        <GameSettings hookForm={{handleSubmit: settingsFormSubmit, control: formHook.control, watch: formHook.watch}} />
                        <BoardGame hookForm={{watch: formHook.watch}} />
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

function GameSettings(props: {hookForm: {handleSubmit: any, control: any, watch: any}}) {
    const { hookForm } = props;
    
    return (
        <div className="setting-wrapper game-settings">
            <p> Settings </p>
            <form onSubmit={(e) => hookForm.handleSubmit(e)}>
                <Controller
                    control={hookForm.control}
                    name="paddleSize"
                    defaultValue={150}
                    render={({ field: { value, onChange }}) => (
                        <label>
                            Paddle Size
                            <input type="range" min={10} max={200} onChange={onChange} value={value} />
                        </label>
                        
                    )}
                />
                <Controller
                    control={hookForm.control}
                    name="playerBackAdvance"
                    defaultValue={20}
                    render={({ field: { value, onChange }}) => (
                        <label>
                            Player Back Advance
                            <input type="range" min={10} max={180} onChange={onChange} value={value} />
                        </label>
                        
                    )}
                />
                <Controller
                    control={hookForm.control}
                    name="playerFrontAdvance"
                    defaultValue={60}
                    render={({ field: { value, onChange }}) => (
                        <label>
                            Player Front Advance
                            <input type="range" min={60} max={350} onChange={onChange} value={value} />
                        </label>
                        
                    )}
                />
                <Controller
                    control={hookForm.control}
                    name="paddleSpeed"
                    defaultValue={13}
                    render={({ field: { value, onChange }}) => (
                        <label>
                            Paddle Speed
                            <input type="range" min={5} max={25} onChange={onChange} value={value} />
                        </label>
                        
                    )}
                />
                <Controller
                    control={hookForm.control}
                    name="ballStartSpeed"
                    defaultValue={5}
                    render={({ field: { value, onChange }}) => (
                        <label>
                            Ball Start Speed
                            <input type="range" min={5} max={25} onChange={onChange} value={value} />
                        </label>
                        
                    )}
                />
                <Controller
                    control={hookForm.control}
                    name="ballAcceleration"
                    defaultValue={1}
                    render={({ field: { value, onChange }}) => (
                        <label>
                            Ball Acceleration
                            <input type="range" min={0.5} max={3} onChange={onChange} value={value} />
                        </label>
                        
                    )}
                />
                <Controller
                    control={hookForm.control}
                    name="pointForVictory"
                    defaultValue={2}
                    render={({ field: { value, onChange }}) => (
                        <label>
                            Point For Victory
                            <input type="range" min={1} max={10} onChange={onChange} value={value} />
                        </label>
                        
                    )}
                />
                <button className="setting-submit" type="submit"> Submit </button>
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

function PlayerListItem(props: {user?: Player, lobbyLength?: number, gameMode?: GameMode, onChangeTeam?: Function, loggedUserId?: number, onChangePos?: Function}) {
    const { user, lobbyLength, gameMode, onChangeTeam, loggedUserId, onChangePos } = props;
    const dispatch = useAppDispatch();
    const displayTeam: boolean = lobbyLength && (gameMode === GameMode.PRIVATE_MATCH || lobbyLength > 2) ? true : false;

    console.log("User in player list", user);
    return user ? (
        <li className={`${displayTeam ? `team-${user.team === TeamSide.BLUE ? "blue" : "red" }` : ""}`} >
            { displayTeam && onChangeTeam && loggedUserId === user.user.id && <TeamCircles user={user} onChangeTeam={onChangeTeam} /> }
            <img className={`player-avatar ${displayTeam ? "avatar-shadow" : ""}`} src={Avatar} alt="profil pic" />
            <p> {user.user.username} </p>
            {
                user.user.id === loggedUserId && lobbyLength && onChangePos && lobbyLength > 1 &&
                <select onChange={(e) => onChangePos(e, user)} value={user.pos === PlayerPosition.BACK ? PlayerPosition.BACK : PlayerPosition.FRONT} className="team-select">
                    <option value={PlayerPosition.BACK} > Paddle Back </option>
                    <option value={PlayerPosition.FRONT} > Paddle Front </option>
                </select>
            }
            {
                user.user.id !== loggedUserId &&
                <p className="player-pos"> {user.pos === PlayerPosition.BACK ? "Paddle Back" : "Paddle Front"} </p>
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