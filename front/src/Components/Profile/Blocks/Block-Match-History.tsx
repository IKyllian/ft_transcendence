import { Link } from "react-router-dom";

import ProfilPic from "../../../Images-Icons/pp.jpg"
import { MatchResult } from "../../../Types/User-Types";
import { UserInterface } from "../../../Types/User-Types";
import ExternalImage from "../../External-Image";

function MatchHistoryItem(props: {match: MatchResult}) {
    const {match} = props;

    return (
        <div className="history-item">
            <div className="player-container">
                <Link to={`/profile/${match.blue_team_player1.username}`}>
                    { match.blue_team_player1.username }
                </Link>
                <ExternalImage src={match.blue_team_player1.avatar} alt="User Avatar" className="avatar-player" userId={match.blue_team_player1.id} />
            </div>
            <p className="history-score">
                <span className={`${match.blue_team_goals > match.red_team_goals ? "higher-score" : ""}`}> {match.blue_team_goals} </span>
                <span> VS </span>
                <span className={`${match.red_team_goals > match.blue_team_goals ? "higher-score" : ""}`}> {match.red_team_goals} </span>
            </p>
            <div className="player-container">
            <ExternalImage src={match.red_team_player1.avatar} alt="User Avatar" className="avatar-player" userId={match.red_team_player1.id} />
                <Link to={`/profile/${match.red_team_player1.username}`}>
                    { match.red_team_player1.username }
                </Link>
            </div>
            
        </div>
    );
}

function BlockMatchHistory(props: {userDatas: UserInterface, matchHistory: MatchResult[]}) {
    const {userDatas, matchHistory} = props;
    return matchHistory.length > 0 ? (
        <div className="profile-block-wrapper history-list">
            {
                matchHistory.map((elem) =>   
                    <MatchHistoryItem key={elem.id} match={elem} />
                )
            }
        </div>
    ) : (
        <p className="err-no-datas"> No games played yet </p>
    );
}

export default BlockMatchHistory;