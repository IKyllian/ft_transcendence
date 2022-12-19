import { Link } from "react-router-dom";
import { IconEye } from "@tabler/icons";
import { UserInterface, UserStatus } from "../../Types/User-Types";
import ExternalImage from "../External-Image";
import DisplayRank from "../Display-Rank";
import { useContext } from "react";
import { SocketContext } from "../../App";

interface LeaderboardItemProps {
    pos: number,
    user: UserInterface
    gamesPlayed: number,
    winRate: string,
    elo: number,
}

function LeaderboardItem(props: LeaderboardItemProps) {
    const { pos, user, gamesPlayed, winRate, elo } = props;
    const {socket} = useContext(SocketContext);

    return (
        <tr className={`${pos >= 1 && pos <= 3 ? "raw-top3" : ""} `}>
            <td> { pos } </td>
            <td> <DisplayRank elo={elo} /> </td>
            <td>
                <div className="user-info">
                    <ExternalImage src={user.avatar} alt="User Avatar" className='user-avatar' userId={user.id} />
                    <Link to={`/profile/${user.username}`}>
                        { user.username }
                    </Link>
                </div>
            </td>
            <td className="responsive-column"> <span> { gamesPlayed } </span> </td>
            <td>  { winRate }% </td>
            <td> { elo } </td>
            <td className="leaderboard-status responsive-column"> 
                <div className={`player-status player-status-${user.status === UserStatus.ONLINE ? "online" : "offline"}`}> </div>
                {
                    user.in_game_id !== null && 
                    <div className="spec-icon">
                        <IconEye onClick={() => socket?.emit("get_gameinfo", user.in_game_id)} />
                    </div>
                }
            </td>
        </tr>
    );
}

export default LeaderboardItem;