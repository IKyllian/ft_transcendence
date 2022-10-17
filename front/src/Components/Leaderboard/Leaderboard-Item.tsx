import { Link } from "react-router-dom";
import { IconEye } from "@tabler/icons";

interface LeaderboardItemProps {
    pos: number,
    name: string,
    gamesPlayed: number,
    winRate: number,
    // points: number,
    isOnline: boolean,
    isInGame: boolean
}

function LeaderboardItem(props: LeaderboardItemProps) {
    const { pos, name, gamesPlayed, winRate, isOnline, isInGame } = props;

    return (
        <tr>
            <td> { pos } </td>
            <td>
                <Link to="/profile">
                    { name }
                </Link>
            </td>
            <td> { gamesPlayed } </td>
            <td className="responsive-column"> { winRate }% </td>
            {/* <td> { points } </td> */}
            <td className="leaderboard-status responsive-column"> 
                <div className={`player-status player-status-${isOnline ? "online" : "offline"}`}> </div>
            </td>
            <td className="leaderboard-spec responsive-column">
                { isInGame && <Link to="#"> <IconEye /> </Link> }
            </td>
        </tr>
    );
}

export default LeaderboardItem;