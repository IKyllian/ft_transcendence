import { GameMode, TeamSide } from "../../Types/Lobby-Types";
import { useLobbyHook } from "../../Hooks/Lobby-Hook";
import GameSettingsWrapper from "./Game-Settings";
import BoardGame from "./Board-Game";
import LobbyButtonsContainer from "./Buttons-Container";
import PlayerListItem from "./Player-Item";

function Lobby() {
    const {
        currentUser,
        isInQueue,
        party,
        gameMode,
        loggedUserIsLeader,
        formHook,
        queueTimer,
        lobbyError,
        onInputChange,
        onReady,
        onGameModeChange,
        settingsFormSubmit,
        startQueue,
        cancelQueue,
        onChangeTeam,
        onChangePos,
    } = useLobbyHook();

    return (
        <div className="lobby-container">
            <div className="lobby-wrapper">
                <ul className="lobby-player-list">
                    {
                        party ? party.players.map((elem) => 
                            <PlayerListItem
                                key={elem.user.id}
                                user={elem}
                                lobbyLength={party.players.length}
                                gameMode={party.game_mode}
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
                        <GameSettingsWrapper 
                            hookForm={{
                                handleSubmit: settingsFormSubmit,
                                control: formHook.control,
                                watch: formHook.watch,
                                getValues: formHook.getValues
                            }}
                            onInputChange={onInputChange}
                            loggedUserIsLeader={loggedUserIsLeader}
                        />
                        <BoardGame hookForm={{watch: formHook.watch}} />
                    </div>
                }
                <LobbyButtonsContainer
                    party={party}
                    gameMode={gameMode}
                    onGameModeChange={onGameModeChange}
                    user={!party ? {isLeader: true, isReady: true, user: currentUser!, team: TeamSide.BLUE} : party?.players.find(elem => elem.user.id === currentUser!.id)}
                    onReady={onReady}
                    loggedUserIsLeader={loggedUserIsLeader}
                    startQueue={startQueue}
                    isInQueue={isInQueue}
                    queueTimer={queueTimer}
                    cancelQueue={cancelQueue}
                    lobbyError={lobbyError}
                />
            </div>
        </div>
    );
}
export default Lobby;