import { useContext } from "react";
import { leaderboardDatas } from "../../Interfaces/Datas-Examples"

import { ModalContext } from "../ModalProvider";

import Header from "../Header/Header";
import LeaderboardItem from "./Leaderboard-Item";

function Leaderboard() {
    const modalStatus = useContext(ModalContext);
    return(
        <>
            <Header />
            <div className={`leaderboard-page-container ${modalStatus.modal.isOpen ? modalStatus.modal.blurClass : ""}`}>
                <h2> Leaderboard </h2>
                <table> 
                    <thead>
                        <tr>
                            <th> Rank </th>
                            <th> Name </th>
                            <th> Games Played </th>
                            <th> Win Rate </th>
                            <th> Points </th>
                            <th> Status </th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            leaderboardDatas.sort((a, b) => { return b.points - a.points; }).map((elem, index) =>   
                                <LeaderboardItem
                                    key={index}
                                    pos={index + 1}
                                    name={elem.name}
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
            </div>
        </>
    );
}

export default Leaderboard;