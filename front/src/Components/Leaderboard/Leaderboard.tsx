import React from "react";

import Header from "../Header/Header";
import LeaderboardItem from "./Leaderboard-Item";

interface leaderboardInterface {
    name: string;
    gamesPlayed: number;
    winRate: number;
    points: number;
    isOnline: boolean;
    isInGame: boolean;
}

const leaderboardDatas: leaderboardInterface[] = [
    {
        name: "Johan",
        gamesPlayed: 100,
        winRate: 50,
        points: 4320,
        isOnline: true,
        isInGame: true,
    }, {
        name: "Kyllian",
        gamesPlayed: 89,
        winRate: 54,
        points: 4120,
        isOnline: false,
        isInGame: false,
    }, {
        name: "Loic",
        gamesPlayed: 95,
        winRate: 49,
        points: 3980,
        isOnline: true,
        isInGame: false,
    }, {
        name: "Arsene",
        gamesPlayed: 65,
        winRate: 60,
        points: 3640,
        isOnline: true,
        isInGame: true,
    }, {
        name: "Chafik",
        gamesPlayed: 40,
        winRate: 46,
        points: 3100,
        isOnline: true,
        isInGame: false,
    }, {
        name: "Karim",
        gamesPlayed: 20,
        winRate: 65,
        points: 2000,
        isOnline: false,
        isInGame: false,
    },
]

function Leaderboard(props: any) {
    const {modalIsOpen, blurClass} = props
    return(
        <>
            <Header modalIsOpen={modalIsOpen} blurClass={blurClass} />
            <div className={`leaderboard-page-container ${blurClass}`}>
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