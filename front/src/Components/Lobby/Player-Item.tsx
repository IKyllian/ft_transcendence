import { useAppDispatch, useAppSelector } from "../../Redux/Hooks";
import { IconCheck, IconPlus } from "@tabler/icons";
import { GameMode, Player, TeamSide, PlayerPosition } from "../../Types/Lobby-Types";
import { changeModalStatus } from "../../Redux/PartySlice";
import ExternalImage from "../External-Image";
import { useLobbyHook } from "../../Hooks/Lobby-Hook";

interface PlayerItemProps {
    user?: Player,
    lobbyLength?: number,
    gameMode?: GameMode,
	isInQueue?: boolean,
    lockForm?: boolean,
}

function TeamCircles(props: {user: Player, disable: boolean}) {
    const {user, disable} = props;
    const { onChangeTeam } = useLobbyHook();
    return (
        <div className="teams-wrapper">
            <div className={`circle-item team1 ${user.team === TeamSide.BLUE ? "team-active" : ""}`} onClick={() => !disable ? onChangeTeam(TeamSide.BLUE, user) : {}}> </div>
            <div className={`circle-item team2 ${user.team === TeamSide.RED ? "team-active" : ""}`} onClick={() => !disable ? onChangeTeam(TeamSide.RED, user) : {}}> </div>
        </div>
    );
}

function PlayerListItem(props: PlayerItemProps) {
    const { user, lobbyLength, gameMode, isInQueue, lockForm } = props;
    const { onChangePos } = useLobbyHook();
    const {currentUser} = useAppSelector(state => state.auth);
    const dispatch = useAppDispatch();

    const displayTeam: boolean = lobbyLength && (gameMode === GameMode.PRIVATE_MATCH || lobbyLength > 2) ? true : false;
    const displaySelectPos: boolean = (lobbyLength && (gameMode === GameMode.PRIVATE_MATCH && lobbyLength > 2) || (gameMode === GameMode.RANKED_2v2 && lobbyLength == 2));

    return user ? (
        <li className={`${displayTeam ? `team-${user.team === TeamSide.BLUE ? "blue" : "red" }` : ""}`} >
            { displayTeam && lockForm !== undefined && currentUser?.id === user.user.id && <TeamCircles user={user} disable={lockForm} /> }
            <ExternalImage src={user.user.avatar} alt="User Avatar" className={`player-avatar ${displayTeam ? "avatar-shadow" : ""}`} userId={user.user.id} />
            <p> {user.user.username} </p>
            {
                user.user.id === currentUser?.id && lobbyLength && onChangePos && displaySelectPos &&
                <select disabled={(isInQueue || lockForm) ? true : false} onChange={(e) => onChangePos(e, user)} value={user.pos === PlayerPosition.BACK ? PlayerPosition.BACK : PlayerPosition.FRONT} className="team-select">
                    <option value={PlayerPosition.BACK} > Paddle Back </option>
                    <option value={PlayerPosition.FRONT} > Paddle Front </option>
                </select>
            }
            {
                user.user.id !== currentUser?.id && lobbyLength && displaySelectPos &&
                <p className="player-pos"> {user.pos === PlayerPosition.BACK ? "Paddle Back" : "Paddle Front"} </p>
            }
            { user.isLeader && <span style={{marginTop: `${!displaySelectPos || (displaySelectPos && currentUser?.id !== user.user.id) ? "10px" : "6px"}`}}> Leader </span> }
            { !user.isLeader && user.isReady && <span style={{marginTop: `${!displaySelectPos || (displaySelectPos && currentUser?.id !== user.user.id) ? "10px" : "6px"}`, color: 'green', borderColor: 'green'}}> <IconCheck /> Ready </span> }
            { !user.isLeader && !user.isReady && <span style={{marginTop: `${!displaySelectPos || (displaySelectPos && currentUser?.id !== user.user.id) ? "10px" : "6px"}`, color: 'red', borderColor: 'red'}}> Not Ready </span> }
        </li>
    ) : (
        <li className="empty-item">
            <IconPlus onClick={() => dispatch(changeModalStatus(true))} />
            <p> Invite Friend </p>
        </li>
    );
}

export default PlayerListItem;