import { UserInterface } from "../Types/User-Types";

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function getMatchPlayed(match_won: number, match_lost: number): number {
    return (match_won + match_lost);
}

export function getSinglesWinRate(user: UserInterface): string {
    const gameplayed: number = getMatchPlayed(user.statistic.singles_match_won,user.statistic.singles_match_lost);
    if (gameplayed > 0)
        return ((user.statistic.singles_match_won / gameplayed) * 100).toFixed();
    return ("0");
}

export function getDoublesWinRate(user: UserInterface): string {
    const gameplayed: number = getMatchPlayed(user.statistic.doubles_match_won, user.statistic.doubles_match_lost);
    if (gameplayed > 0)
        return ((user.statistic.doubles_match_won / gameplayed) * 100).toFixed();
    return ("0");
}

export function userIdIsBlocked(connectedUser: UserInterface, secondUserId: number): boolean {
    return (connectedUser.blocked.find(elem => elem.id === secondUserId) ? true : false);
}

export function createdAccountDate(date: string) {
    const dateCreated = new Date(date);

    return `${dateCreated.getDate()} ${monthNames[dateCreated.getMonth()]} ${dateCreated.getFullYear()}`
}