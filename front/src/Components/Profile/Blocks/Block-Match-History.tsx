import React from "react";
import {matchHistory} from "../../../Interfaces/Datas-Examples"

import MatchHistoryItem from "../Items/Match-History-Item";

function BlockMatchHistory() {
    return (
        <div className="history-list">
            {
                matchHistory.map((elem, index) =>   
                    <MatchHistoryItem key={index} player={elem.player} enemyPlayer={elem.enemyPlayer} playerScore={elem.playerScore} enemyScore={elem.enemyScore} />
                )
            }
        </div>
    );
}

export default BlockMatchHistory;