import React from "react";
import { RootState } from '../../Redux/Store'
import { useAppSelector } from '../../Redux/Hooks'
import { ModalState } from "../../Interfaces/Interface-Modal";
import {leaderboardDatas} from "../../Interfaces/Datas-Examples"

import Header from "../Header/Header";
import LeaderboardItem from "./Leaderboard-Item";

function Leaderboard() {
    const modalStatus: ModalState =  useAppSelector((state: RootState) => state.modal);
    return(
        <>
            <Header />
            <div className={`leaderboard-page-container ${modalStatus.isOpen ? modalStatus.blurClass : ""}`}>
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
                            leaderboardDatas.map((elem, index) =>   
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