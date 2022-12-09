import api from "./Api";

export function fetchSinglesLeaderBoardDatas(skip: number, setLeaderboardState: Function) {
    api.post(`/game/singles-leaderboard`, {skip: skip})
    .then(response => {
        console.log("response", response);
        setLeaderboardState((prev: any) => {return {...response.data, loading: false, page: prev.page, mode: prev.mode}});
    })
    .catch(err => {
        console.log(err);
    })
}

export function fetchDoublesLeaderBoardDatas(skip: number, setLeaderboardState: Function) {
    api.post(`/game/doubles-leaderboard`, {skip: skip})
    .then(response => {
        console.log("response", response);
        setLeaderboardState((prev: any) => {return {...response.data, loading: false, page: prev.page, mode: prev.mode}});
    })
    .catch(err => {
        console.log(err);
    })
}