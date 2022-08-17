import React from "react";
import { Link } from "react-router-dom";
import { IconEye } from "@tabler/icons";

function LeaderboardItem(props: any) {
    const { pos, name, gamesPlayed, winRate, points, isOnline, isInGame } = props;

    return (
        <tr>
            <td> { pos } </td>
            <td>
                <Link to="/profile">
                    { name }
                </Link>
            </td>
            <td> { gamesPlayed } </td>
            <td> { winRate }% </td>
            <td> { points } </td>
            <td className="leaderboard-status"> 
                <div className={`player-status player-status-${isOnline ? "online" : "offline"}`}> </div>
            </td>
            <td className="leaderboard-spec">
                { isInGame && <Link to="#"> <IconEye /> </Link> }
            </td>
        </tr>
    );
}

export default LeaderboardItem;