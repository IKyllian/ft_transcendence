import { useState } from "react";
import { useAppDispatch } from "../../Redux/Hooks";
import { IconChevronUp, IconChevronDown, IconX, IconLock } from "@tabler/icons";
import { GameModeState, Player, PartyInterface, QueueTimerInterface } from "../../Types/Lobby-Types";
import { changeSidebarChatStatus } from "../../Redux/PartySlice";
import { partyQueueString } from "../../Utils/Utils-Party";

interface Props {
    party: PartyInterface | undefined,
    gameMode: GameModeState,
    onGameModeChange: Function,
    user: Player | undefined,
    onReady: Function,
    partyReady: boolean,
    loggedUserIsLeader: boolean,
    startQueue: Function,
    isInQueue: boolean,
    queueTimer: QueueTimerInterface,
    cancelQueue: Function
}

function LobbyButtonsContainer(props: Props) {
    const { party, gameMode, onGameModeChange, user, onReady, partyReady, loggedUserIsLeader, startQueue, isInQueue, queueTimer, cancelQueue } = props;
    const dispatch = useAppDispatch();
    const [displayDrop, setDisplayDrop] = useState<boolean>(false);
    
    const gameModeOnclick = () => {
        if (loggedUserIsLeader && !isInQueue)
            setDisplayDrop(!displayDrop)
    }
    return user ? (
        <div className="lobby-buttons-wrapper">
            <button style={{cursor: "pointer"}} onClick={() => dispatch(changeSidebarChatStatus())}> Party Chat </button>
            { user.isLeader && !isInQueue && partyReady && <button className="start-button" onClick={() => startQueue()}> Start Game </button> }
            { user.isLeader && !isInQueue && !partyReady && <button> Waiting for players </button> }
            { isInQueue && <button className="queue-button"> <IconX onClick={() => cancelQueue()} /> {partyQueueString(queueTimer)} </button> }
            { !user.isLeader && !isInQueue && user.isReady && <button className="start-button" onClick={() => onReady(false)}> Not Ready </button> }
            { !user.isLeader && !isInQueue && !user.isReady && <button className="start-button" onClick={() => onReady(true)}> Ready </button> }
            <button style={loggedUserIsLeader && !isInQueue ? {cursor: "pointer"} : {}} className={`game-modes-button ${displayDrop ? "bos" : ""}`} onClick={() => gameModeOnclick()}>
                { !party && gameMode.gameModes[gameMode.indexSelected].gameMode }
                { party && party.game_mode }
                { displayDrop && !isInQueue && loggedUserIsLeader && <IconChevronDown className="chevron-icon" /> }
                { !displayDrop && !isInQueue && loggedUserIsLeader && <IconChevronUp className="chevron-icon" /> }
            </button>
            { loggedUserIsLeader && !isInQueue && <DropdownGameModes show={displayDrop} gameMode={gameMode} onGameModeChange={onGameModeChange} setDisplayDrop={setDisplayDrop} /> }
        </div>
    ) : (
        <> </>
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