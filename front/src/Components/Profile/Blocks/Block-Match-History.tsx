import {matchHistory} from "../../../Types/Datas-Examples"
import { UserInterface } from "../../../Types/User-Types";

import MatchHistoryItem from "../Items/Match-History-Item";

function BlockMatchHistory(props: {userDatas: UserInterface}) {
    const {userDatas} = props;
    return (
        // <div className="profile-block-wrapper history-list">
        //     {
        //         matchHistory.map((elem, index) =>   
        //             <MatchHistoryItem key={index} player={elem.player} enemyPlayer={elem.enemyPlayer} playerScore={elem.playerScore} enemyScore={elem.enemyScore} />
        //         )
        //     }
        // </div>
        <p className="err-no-datas"> No games played yet </p>
    );
}

export default BlockMatchHistory;