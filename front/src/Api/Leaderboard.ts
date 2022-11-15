import axios from "axios";
import { baseUrl } from "../env";

export function fetchSinglesLeaderBoardDatas(skip: number, token: string, setLeaderboardState: Function) {
    axios.post(`${baseUrl}/game/singles-leaderboard`, {skip: skip}, {
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    })
    .then(response => {
        console.log("response", response);
        setLeaderboardState((prev: any) => {return {...response.data, loading: false, page: prev.page, mode: prev.mode}});
    })
    .catch(err => {
        console.log(err);
    })
}

export function fetchDoublesLeaderBoardDatas(skip: number, token: string, setLeaderboardState: Function) {
    axios.post(`${baseUrl}/game/doubles-leaderboard`, {skip: skip}, {
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    })
    .then(response => {
        console.log("response", response);
        setLeaderboardState((prev: any) => {return {...response.data, loading: false, page: prev.page, mode: prev.mode}});
    })
    .catch(err => {
        console.log(err);
    })
}