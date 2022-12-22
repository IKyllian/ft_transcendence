import { useState } from "react";
import { Link } from "react-router-dom";
import { GameType } from "../../../Types/Lobby-Types";
import { MatchResult } from "../../../Types/User-Types";
import { UserInterface } from "../../../Types/User-Types";
import ExternalImage from "../../External-Image";

export enum HistoricFilter {
	Singles = "Singles",
	Doubles = "Doubles",
    All = "All",
}

function HistoryUserItem(props: {reverse: boolean, player: UserInterface}) {
    const { reverse, player } = props;
    return (
        <div className={`player-container ${reverse ? "side-reverse" : ""}`}>
            <ExternalImage src={player.avatar} alt="User Avatar" className="avatar-player" userId={player.id} />
            <Link to={`/profile/${player.username}`}>
                { player.username }
            </Link>
        </div>
    )
}

function MatchHistoryItem(props: {match: MatchResult}) {
    const { match } = props;
    return (
        <div className="history-item">
            {
                match.game_type === GameType.Doubles && match.blue_team_player2 && 
                <div className="wrapper-2v2">
                    <HistoryUserItem reverse={true} player={match.blue_team_player1} />
                    <HistoryUserItem reverse={true} player={match.blue_team_player2} />
                </div>
            }
            {
                match.game_type === GameType.Singles &&
                <HistoryUserItem reverse={true} player={match.blue_team_player1} />
            }
            <p className="history-score">
            <span className={`${match.blue_team_goals > match.red_team_goals ? "higher-score" : ""}`}> {match.blue_team_goals} </span>
            <span> VS </span>
            <span className={`${match.red_team_goals > match.blue_team_goals ? "higher-score" : ""}`}> {match.red_team_goals} </span>
            </p>
            {
                match.game_type === GameType.Doubles && match.red_team_player2 && 
                <div className="wrapper-2v2">
                    <HistoryUserItem reverse={false} player={match.red_team_player1} />
                    <HistoryUserItem reverse={false} player={match.red_team_player2} />
                </div>
            }
            {
                match.game_type === GameType.Singles &&
                <HistoryUserItem reverse={false} player={match.red_team_player1} />
            }
        </div>
    );
}


function FilterHistoric(props: {historyFilter: HistoricFilter, changeMode: Function}) {
    const { historyFilter, changeMode } = props;
    return (
        <select onChange={(e) => changeMode(e)} value={historyFilter} className="filter-select">
            <option value={HistoricFilter.Singles}> {HistoricFilter.Singles} </option>
            <option value={HistoricFilter.Doubles}> {HistoricFilter.Doubles} </option>
            <option value={HistoricFilter.All}> {HistoricFilter.All} </option>
        </select>

    );
}

function BlockMatchHistory(props: {matchHistory: MatchResult[]}) {
    const { matchHistory } = props;
    const [historyFilter, setHistoryFilter] = useState<HistoricFilter>(HistoricFilter.All);
    const [historyCpy, setHistoryCpy] = useState<MatchResult[]>([]);

    const changeMode = (e: any) => {
        if (e.target.value === HistoricFilter.Singles)
            setHistoryCpy([...matchHistory.filter(elem => elem.game_type === GameType.Singles)]);
        else if (e.target.value === HistoricFilter.Doubles)
            setHistoryCpy([...matchHistory.filter(elem => elem.game_type === GameType.Doubles)]);
        setHistoryFilter(e.target.value);
    }

    if (historyFilter === HistoricFilter.Singles && !matchHistory.find(elem => elem.game_type === GameType.Singles)) {
        return (
            <div className="profile-block-wrapper history-list">
                <FilterHistoric historyFilter={historyFilter} changeMode={changeMode} />
                <p className="err-no-datas"> No singles games played yet </p>
            </div>
        );
    }
    
    if (historyFilter === HistoricFilter.Doubles && !matchHistory.find(elem => elem.game_type === GameType.Doubles)) {
        return (
            <div className="profile-block-wrapper history-list">    
                <FilterHistoric historyFilter={historyFilter} changeMode={changeMode} />
                <p className="err-no-datas"> No doubles games played yet </p>
            </div>
        );
    }

    return matchHistory.length > 0 ? (
        <div className="profile-block-wrapper history-list">
            <FilterHistoric historyFilter={historyFilter} changeMode={changeMode} />
            {
                historyFilter === HistoricFilter.All && 
                matchHistory.map((elem) =>   
                        <MatchHistoryItem key={elem.id} match={elem} />
                    )
            }
            {
                historyFilter !== HistoricFilter.All && 
                historyCpy.map((elem) =>   
                    <MatchHistoryItem key={elem.id} match={elem} />
                )
            }
        </div>
    ) : (
        <p className="err-no-datas"> No games played yet </p>
    );
}

export default BlockMatchHistory;