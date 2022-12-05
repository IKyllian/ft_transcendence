import { Link } from "react-router-dom";
import { GameType } from "../../../Types/Lobby-Types";
import { MatchResult } from "../../../Types/User-Types";
import { UserInterface } from "../../../Types/User-Types";
import ExternalImage from "../../External-Image";

function MatchHistoryItem(props: {match: MatchResult}) {
    const {match} = props;
    return (
        <div className="history-item">
            {
                match.game_type === GameType.Doubles && match.blue_team_player2 && 
                <div className="wrapper-2v2">
                    <div className="player-container side-reverse">
                        <ExternalImage src={match.blue_team_player1.avatar} alt="User Avatar" className="avatar-player" userId={match.blue_team_player1.id} />
                        <Link to={`/profile/${match.blue_team_player1.username}`}>
                            { match.blue_team_player1.username }
                        </Link>
                    </div>
                    <div className="player-container side-reverse">
                        <ExternalImage src={match.blue_team_player2.avatar} alt="User Avatar" className="avatar-player" userId={match.blue_team_player2.id} />
                        <Link to={`/profile/${match.blue_team_player2.username}`}>
                            { match.blue_team_player2.username }
                        </Link>
                    </div>
                </div>
            }
            {
                match.game_type === GameType.Singles &&
                <div className="player-container side-reverse">
                    <ExternalImage src={match.blue_team_player1.avatar} alt="User Avatar" className="avatar-player" userId={match.blue_team_player1.id} />
                    <Link to={`/profile/${match.blue_team_player1.username}`}>
                        { match.blue_team_player1.username }
                    </Link>
                </div>
            }
            <p className="history-score">
            <span className={`${match.blue_team_goals > match.red_team_goals ? "higher-score" : ""}`}> {match.blue_team_goals} </span>
            <span> VS </span>
            <span className={`${match.red_team_goals > match.blue_team_goals ? "higher-score" : ""}`}> {match.red_team_goals} </span>
            </p>
            {
                match.game_type === GameType.Doubles && match.red_team_player2 && 
                <div className="wrapper-2v2">
                    <div className="player-container">
                            <ExternalImage src={match.red_team_player1.avatar} alt="User Avatar" className="avatar-player" userId={match.red_team_player1.id} />
                            <Link to={`/profile/${match.red_team_player1.username}`}>
                                { match.red_team_player1.username }
                            </Link>
                    </div>
                    <div className="player-container">
                            <ExternalImage src={match.red_team_player2.avatar} alt="User Avatar" className="avatar-player" userId={match.red_team_player2.id} />
                            <Link to={`/profile/${match.red_team_player2.username}`}>
                                { match.red_team_player2.username }
                            </Link>
                    </div>
                </div>
            }
            {
                match.game_type === GameType.Singles &&
                <div className="player-container">
                    <ExternalImage src={match.red_team_player1.avatar} alt="User Avatar" className="avatar-player" userId={match.red_team_player1.id} />
                    <Link to={`/profile/${match.red_team_player1.username}`}>
                        { match.red_team_player1.username }
                    </Link>
                </div>
            }
        </div>
    );
}

function BlockMatchHistory(props: {matchHistory: MatchResult[]}) {
    const {matchHistory} = props;
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