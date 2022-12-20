import { useState } from "react";
import { useAppDispatch } from "../../Redux/Hooks";
import { IconChevronUp, IconChevronDown, IconX, IconLock } from "@tabler/icons";
import { GameModeState, Player, PartyInterface, QueueTimerInterface, GameMode } from "../../Types/Lobby-Types";
import { changeSidebarChatStatus } from "../../Redux/PartySlice";
import { partyQueueString } from "../../Utils/Utils-Party";

interface Props {
    party: PartyInterface | undefined,
    gameMode: GameModeState,
    onGameModeChange: Function,
    user: Player | undefined,
    onReady: Function,
    loggedUserIsLeader: boolean,
    startQueue: Function,
    isInQueue: boolean,
    queueTimer: QueueTimerInterface,
    cancelQueue: Function,
    lobbyError: String | undefined,
}

function LobbyButtonsContainer(props: Props) {
    const { party, gameMode, onGameModeChange, user, onReady, loggedUserIsLeader, startQueue, isInQueue, queueTimer, cancelQueue, lobbyError } = props;
    
    return user ? (
        <div className="lobby-buttons-wrapper">
            <PartyChatButton party={party} />
            <StartButton user={user} isInQueue={isInQueue} cancelQueue={cancelQueue} startQueue={startQueue} onReady={onReady} queueTimer={queueTimer} lobbyError={lobbyError} gameMode={gameMode} />
            <GameModeButton party={party} gameMode={gameMode} onGameModeChange={onGameModeChange} loggedUserIsLeader={loggedUserIsLeader} isInQueue={isInQueue} />
        </div>
    ) : (
        <> </>
    );
}

function GameModeButton(props: { party: PartyInterface | undefined, gameMode: GameModeState, onGameModeChange: Function, loggedUserIsLeader: boolean, isInQueue: boolean }) {
    const { party, gameMode, onGameModeChange, loggedUserIsLeader, isInQueue } = props;
    const [displayDrop, setDisplayDrop] = useState<boolean>(false);

    const gameModeOnclick = () => {
        if (loggedUserIsLeader && !isInQueue)
            setDisplayDrop(!displayDrop)
    }

    return (
        <>
            <button style={loggedUserIsLeader && !isInQueue ? {cursor: "pointer"} : {}} className={`game-modes-button ${displayDrop ? "bos" : ""}`} onClick={() => gameModeOnclick()}>
                { !party && gameMode.gameModes[gameMode.indexSelected].gameMode }
                { party && party.game_mode }
                { displayDrop && !isInQueue && loggedUserIsLeader && <IconChevronDown className="chevron-icon" /> }
                { !displayDrop && !isInQueue && loggedUserIsLeader && <IconChevronUp className="chevron-icon" /> }
            </button>
            { loggedUserIsLeader && !isInQueue && <DropdownGameModes show={displayDrop} gameMode={gameMode} onGameModeChange={onGameModeChange} setDisplayDrop={setDisplayDrop} /> }
        </>
    );
}

function StartButton(props: {user: Player, isInQueue: boolean, cancelQueue: Function, startQueue: Function, onReady: Function, queueTimer: QueueTimerInterface, lobbyError: String | undefined,  gameMode: GameModeState}) {
    const { user, isInQueue, cancelQueue, startQueue, onReady, queueTimer, lobbyError, gameMode } = props;

    return (
        <>
            { user.isLeader && !isInQueue && !lobbyError && <button className="start-button" onClick={() => startQueue()}> {gameMode.gameModes[gameMode.indexSelected].gameMode === GameMode.PRIVATE_MATCH ? "Start Game" : "Play"} </button> }
            { user.isLeader && !isInQueue && lobbyError && <button className="start-button" lobby-error={`${lobbyError}`} > <IconLock className="lock-icon" /> {gameMode.gameModes[gameMode.indexSelected].gameMode === GameMode.PRIVATE_MATCH ? "Start Game" : "Play"} </button> }
            { isInQueue && <button className="queue-button"> <IconX onClick={() => cancelQueue()} /> {partyQueueString(queueTimer)} </button> }
            { !user.isLeader && !isInQueue && user.isReady && <button className="start-button" onClick={() => onReady(false)}> Unready </button> }
            { !user.isLeader && !isInQueue && !user.isReady && <button className="start-button" onClick={() => onReady(true)}> Ready </button> }
        </>
    );
}

function PartyChatButton(props : { party: PartyInterface | undefined }) {
    const { party } = props;
    const dispatch = useAppDispatch();
    return (
        <>
            { !party && <button style={{cursor: "pointer"}} className="lock-button" onClick={() => dispatch(changeSidebarChatStatus())}> <IconLock className="lock-icon" /> Party Chat </button> }
            { party && <button style={{cursor: "pointer"}} onClick={() => dispatch(changeSidebarChatStatus())}> Party Chat </button> }
        </>
    );
}

function DropdownGameModes(props: {show: boolean, gameMode: GameModeState, onGameModeChange: Function, setDisplayDrop: Function}) {
    const { show, gameMode, onGameModeChange, setDisplayDrop } = props;
    return show ? (
        <div className="game-modes-dropdown">
            <ul>
                {
                    gameMode.gameModes.map((elem, index) => {
                        if (elem.isLock)
                            return <li className="gameMode-lock" key={index}> <IconLock className="lock-icon" /> {elem.gameMode} </li>
                        else
                            return <li key={index} onClick={() => {onGameModeChange(index, elem.gameMode); setDisplayDrop(false)}}> {elem.gameMode} </li>
                    })
                }
            </ul>
        </div>
    ) : (
        <> </>
    );
}

export default LobbyButtonsContainer;