import { useAppDispatch } from "../../Redux/Hooks";
import { IconCheck, IconPlus } from "@tabler/icons";
import { GameMode, Player, TeamSide, PlayerPosition } from "../../Types/Lobby-Types";
import { changeModalStatus } from "../../Redux/PartySlice";
import ExternalImage from "../External-Image";

interface PlayerItemProps {
    user?: Player,
    lobbyLength?: number,
    gameMode?: GameMode,
    onChangeTeam?: Function,
    loggedUserId?: number,
    onChangePos?: Function
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

function PlayerListItem(props: PlayerItemProps) {
    const { user, lobbyLength, gameMode, onChangeTeam, loggedUserId, onChangePos } = props;
    const dispatch = useAppDispatch();
    const displayTeam: boolean = lobbyLength && (gameMode === GameMode.PRIVATE_MATCH || lobbyLength > 2) ? true : false;
    const displaySelectPos: boolean = (lobbyLength && (gameMode === GameMode.PRIVATE_MATCH && lobbyLength > 2) || (gameMode === GameMode.RANKED_2v2 && lobbyLength == 2));

    return user ? (
        <li className={`${displayTeam ? `team-${user.team === TeamSide.BLUE ? "blue" : "red" }` : ""}`} >
            { displayTeam && onChangeTeam && loggedUserId === user.user.id && <TeamCircles user={user} onChangeTeam={onChangeTeam} /> }
            <ExternalImage src={user.user.avatar} alt="User Avatar" className={`player-avatar ${displayTeam ? "avatar-shadow" : ""}`} userId={user.user.id} />
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
            { !user.isLeader && user.isReady && <span style={{marginTop: `${!displaySelectPos || (displaySelectPos && loggedUserId !== user.user.id) ? "10px" : "6px"}`, color: 'green', borderColor: 'green'}}> <IconCheck /> Ready </span> }
            { !user.isLeader && !user.isReady && <span style={{marginTop: `${!displaySelectPos || (displaySelectPos && loggedUserId !== user.user.id) ? "10px" : "6px"}`, color: 'red', borderColor: 'red'}}> Not Ready </span> }
        </li>
    ) : (
        <li className="empty-item">
            <IconPlus onClick={() => dispatch(changeModalStatus(true))} />
            <p> Invite Friend </p>
        </li>
    );
}

export default PlayerListItem;