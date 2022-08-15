import React from "react";

import ProfilPic from "../../../Images-Icons/pp.jpg"

function MatchHistoryItem(props: any) {
    const {player, date, score, isWin} = props;

    return (
        <div className="history-item">
            <p> Kyllian </p>
            <img className='avatar-player' src={ProfilPic} alt="profil pic" />
            <p className="history-score"> <span> 4 </span> <span> VS </span>  <span> 1 </span> </p>
            <img className='avatar-player' src={ProfilPic} alt="profil pic" />
            <p> Johan </p>
        </div>
    );
}

export default MatchHistoryItem;