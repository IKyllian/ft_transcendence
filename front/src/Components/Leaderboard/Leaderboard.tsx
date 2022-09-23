import { useContext, useEffect, useState } from "react";
import { leaderboardDatas } from "../../Types/Datas-Examples"
import { ExampleUser } from "../../Types/User-Types";
import { ModalContext } from "../Utils/ModalProvider";

import LeaderboardItem from "./Leaderboard-Item";

function Leaderboard() {
    const modalStatus = useContext(ModalContext);
    const [lbDatas, setlbDatas] = useState<ExampleUser[] | undefined>(undefined);

    useEffect(() => {
        if (leaderboardDatas.length > 0) {
            setlbDatas(leaderboardDatas);
        }
    }, [lbDatas]);


    return (lbDatas !== undefined) ? (
        <div className={`leaderboard-page-container ${modalStatus.modal.isOpen ? modalStatus.modal.blurClass : ""}`}>
            <h2> Leaderboard </h2>
            <table> 
                <thead>
                    <tr>
                        <th> Rank </th>
                        <th> Name </th>
                        <th> Games Played </th>
                        <th className="responsive-column"> Win Rate </th>
                        <th> Points </th>
                        <th className="responsive-column"> Status </th>
                    </tr>
                </thead>
                <tbody>
                    {
                        lbDatas.sort((a, b) => { return b.points - a.points; }).map((elem, index) =>   
                            <LeaderboardItem
                                key={index}
                                pos={index + 1}
                                name={elem.username}
                                gamesPlayed={elem.gamesPlayed}
                                winRate={elem.winRate}
                                points={elem.points}
                                isOnline={elem.isOnline}
                                isInGame={elem.isInGame}
                            />
                        )
                    }
                </tbody>
            </table>
            {/* <div className="pagination">
                <div className="pagination-wrapper">
                    <div className="pagination-item" onClick={() => setPaginationState(1)}>
                        <p> 1 </p>
                    </div>
                    <div className="pagination-item" onClick={() => setPaginationState(2)}>
                        <p> 2 </p>
                    </div>
                </div>
            </div> */}
        </div>
    ) : (
        <p> loading </p>
    )
}

export default Leaderboard;