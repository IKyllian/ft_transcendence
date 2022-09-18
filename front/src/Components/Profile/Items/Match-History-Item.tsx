import { Link } from "react-router-dom";
import ProfilPic from "../../../Images-Icons/pp.jpg"
import { ExampleUser } from "../../../Types/User-Types";

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

export default MatchHistoryItem;