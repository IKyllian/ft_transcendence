import { UserInterface } from "../Types/User-Types";

export function getMatchPlayed(user: UserInterface): number {
    return (user.statistic.matchWon + user.statistic.matchLost);
}

export function getWinRate(user: UserInterface): number {
    const gameplayed = getMatchPlayed(user);
    if (gameplayed > 0)
        return ((user.statistic.matchWon / getMatchPlayed(user)) * 100);
    return (0);
}