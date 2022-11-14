import { UserInterface } from "../Types/User-Types";
import { useAppSelector } from "../Redux/Hooks";

export function getMatchPlayed(user: UserInterface): number {
    return (user.statistic.match_won + user.statistic.match_lost);
}

export function getWinRate(user: UserInterface): string {
    const gameplayed: number = getMatchPlayed(user);
    if (gameplayed > 0)
        return ((user.statistic.match_won / getMatchPlayed(user)) * 100).toFixed();
    return ("0");
}

export function userIdIsBlocked(connectedUser: UserInterface, secondUserId: number): boolean {
    return (connectedUser.blocked.find(elem => elem.id === secondUserId) ? true : false);
}

export function IsLog() {
    let authDatas = useAppSelector((state) => state.auth);
    
    if (authDatas.currentUser === undefined)
        return false;
    else
        return true;
}