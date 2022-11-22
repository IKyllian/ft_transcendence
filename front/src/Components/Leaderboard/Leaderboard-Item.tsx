import { Link } from "react-router-dom";
import { IconEye } from "@tabler/icons";
import Avatar from "../../Images-Icons/pp.jpg";
import { UserStatus } from "../../Types/User-Types";

interface LeaderboardItemProps {
    pos: number,
    name: string,
    status: UserStatus,
    gamesPlayed: number,
    winRate: string,
    elo: number,
}

function LeaderboardItem(props: LeaderboardItemProps) {
    const { pos, name, status, gamesPlayed, winRate, elo } = props;

    return (
        <tr className={`${pos >= 1 && pos <= 3 ? "raw-top3" : ""} `}>
            <td> { pos } </td>
            <td>
                <div className="user-info">
                    <img className='user-avatar' src={Avatar} alt="profil pic" />
                    <Link to={`/profile/${name}`}>
                        { name }
                    </Link>
                </div>
            </td>
            <td className="responsive-column"> <span> { gamesPlayed } </span> </td>
            <td>  { winRate }% </td>
            <td> { elo } </td>
            <td className="leaderboard-status responsive-column"> 
                <div className={`player-status player-status-${status === UserStatus.ONLINE ? "online" : "offline"}`}> </div>
            </td>
            {/* <td className="leaderboard-spec responsive-column">
                { isInGame && <Link to="#"> <IconEye /> </Link> }
            </td> */}
        </tr>
    );
}

export default LeaderboardItem;