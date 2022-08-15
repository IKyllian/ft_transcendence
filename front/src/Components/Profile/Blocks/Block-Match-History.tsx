import React from "react";

import MatchHistoryItem from "../Items/Match-History-Item";

interface matchDatas {
    player: string,
    date: string,
    score: string,
    isWin: boolean,
}

const matchHistory: matchDatas[] = [
    {
        player: "Johan",
        date: "12/08/2022",
        score: "10/5",
        isWin: true,
    }, {
        player: "Zippy",
        date: "12/08/2022",
        score: "10/8",
        isWin: true,
    }, {
        player: "Drow3yyy",
        date: "12/08/2022",
        score: "7/10",
        isWin: false,
    }, {
        player: "Karim",
        date: "12/08/2022",
        score: "10/4",
        isWin: true,
    },
]

function BlockMatchHistory() {
    return (
        <div className="history-list">
            {
                matchHistory.map((elem, index) =>   
                    <MatchHistoryItem key={index} player={elem.player} date={elem.date} score={elem.score} isWin={elem.isWin} />
                )
            }
        </div>
    );
}

export default BlockMatchHistory;