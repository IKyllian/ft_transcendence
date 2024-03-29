import { useContext, useEffect, useState } from "react";
import { fetchSinglesLeaderBoardDatas, fetchDoublesLeaderBoardDatas } from "../../Api/Leaderboard";
import { SocketContext } from "../../App";
import { UserInterface, UserStatus } from "../../Types/User-Types";
import { Modes } from "../../Types/Utils-Types";
import { getDoublesWinRate, getMatchPlayed, getSinglesWinRate } from "../../Utils/Utils-User";
import LoadingSpin from "../Utils/Loading-Spin";
import { ModalContext } from "../Utils/ModalProvider";

import LeaderboardItem from "./Leaderboard-Item";

interface LeaderboardState {
    users: UserInterface[],
    nb_of_users: number,
    page: number,
    loading: boolean
    mode: Modes,
}

const defaultState: LeaderboardState = {
    users: [],
    nb_of_users: 0,
    page: 1,
    loading: true,
    mode: Modes.Singles, 
}

function Leaderboard() {
    const modalStatus = useContext(ModalContext);
    const [leaderboardState, setLeaderboardState] = useState<LeaderboardState>(defaultState);
    const {socket} = useContext(SocketContext);

    useEffect(() => {
        fetchSinglesLeaderBoardDatas(0, setLeaderboardState);

        socket?.on("InGameStatusUpdate", (data: {id: number, in_game_id: string | null}) => {
            setLeaderboardState(prev => { return {...prev, users: [...prev.users.map((elem: UserInterface) => {
                if (elem.id === data.id)
                    return {...elem, in_game_id: data.in_game_id};
                return elem;
            })]}});
        });

        socket?.on("StatusUpdate", (data: {id: number, status: UserStatus}) => {
            setLeaderboardState(prev => { return {...prev, users: [...prev.users.map((elem: UserInterface) => {
                if (elem.id === data.id)
                    return {...elem, status: data.status};
                return elem;
            })]}});
        });

        return () => {
            socket?.off("InGameStatusUpdate");
            socket?.off("StatusUpdate");
        }
    }, [socket])

    const changePage = (index: number) => {
        if (index + 1 !== leaderboardState.page) {
            if (leaderboardState.mode === Modes.Singles)
                fetchSinglesLeaderBoardDatas(index, setLeaderboardState);
            else
                fetchDoublesLeaderBoardDatas(index, setLeaderboardState);
            setLeaderboardState((prev) => { return {...prev, page: index + 1} })
        }
    }

    const onLeaderboardChange = (e: any) => {
        const mode: Modes = e.target.value;
        setLeaderboardState(() => { return {...defaultState, mode: mode}})
        if (mode === Modes.Singles)
            fetchSinglesLeaderBoardDatas(0, setLeaderboardState);
        else
            fetchDoublesLeaderBoardDatas(0, setLeaderboardState);
    }

    return (!leaderboardState.loading) ? (
        <div className={`leaderboard-page-container ${modalStatus.modal.isOpen ? modalStatus.modal.blurClass : ""}`}>
            <h2> Leaderboard </h2>
            <select onChange={(e) => onLeaderboardChange(e)} value={leaderboardState.mode} className="mode-select">
                <option value={Modes.Singles} > {Modes.Singles} </option>
                <option value={Modes.Doubles} > {Modes.Doubles} </option>
            </select>
            {
                leaderboardState.users.length > 0 && 
                <>
                    <table> 
                        <thead>
                            <tr>
                                <th> Pos </th>
                                <th> Rank </th>
                                <th> Name </th>
                                <th className="responsive-column"> Games Played </th>
                                <th> Win Rate </th>
                                <th> Elo </th>
                                <th className="responsive-column"> Status </th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                leaderboardState.users.map((elem, index) => (
                                    <LeaderboardItem
                                        key={elem.id}
                                        user={elem}
                                        pos={((index + 1) + ((leaderboardState.page - 1) * 10))}
                                        gamesPlayed={getMatchPlayed(leaderboardState.mode === Modes.Singles ? elem.statistic.singles_match_won : elem.statistic.doubles_match_won, leaderboardState.mode === Modes.Singles ? elem.statistic.singles_match_lost : elem.statistic.doubles_match_lost)}
                                        winRate={leaderboardState.mode === Modes.Singles ? getSinglesWinRate(elem) : getDoublesWinRate(elem)}
                                        elo={leaderboardState.mode === Modes.Singles ? elem.singles_elo : elem.doubles_elo}
                                    />
                                ))
                            }
                        </tbody>
                    </table>
                    <div className="pagination">
                        <div className="pagination-wrapper">
                            {
                                Array.from({length: Math.ceil(leaderboardState.nb_of_users / 10)}, (elem, index) => (
                                    <div key={index} className="pagination-item" onClick={() => changePage(index)}>
                                        <p> {index + 1} </p>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </>
            }
            {
                leaderboardState.users.length <= 0 &&
                <p style={{textAlign: "center"}}> No User </p>
            }
        </div>
    ) : (
        <LoadingSpin classContainer="leaderboard-page-container" />
    )
}

export default Leaderboard;