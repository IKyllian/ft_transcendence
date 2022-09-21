import { Link } from "react-router-dom";

import ProfilPic from "../../../Images-Icons/pp.jpg"
import { ExampleUser } from "../../../Types/User-Types";
import { UserInterface } from "../../../Types/User-Types";


interface historyItemProps {
    player: ExampleUser,
    enemyPlayer: ExampleUser,
    playerScore: number,
    enemyScore: number,
}

function MatchHistoryItem(props: historyItemProps) {
    const {player, enemyPlayer, playerScore, enemyScore} = props;

    return (
        <div className="history-item">
            <div className="player-container">
                <p> {player.username } </p>
                <img className='avatar-player' src={ProfilPic} alt="profil pic" />
            </div>
            <p className="history-score">
                <span className={`${playerScore > enemyScore ? "higher-score" : ""}`}> {playerScore} </span>
                <span> VS </span>
                <span className={`${enemyScore > playerScore ? "higher-score" : ""}`}> {enemyScore} </span>
            </p>
            <div className="player-container">
                <img className='avatar-player' src={ProfilPic} alt="profil pic" />
                <Link to="/profile">
                    {enemyPlayer.username}
                </Link>
            </div>
            
        </div>
    );
}

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