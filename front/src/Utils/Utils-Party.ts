import { Player, QueueTimerInterface } from "../Types/Lobby-Types";

export function loggedUserIsLeader(loggedUserId: number, partyUsers: Player[]): boolean {
    return partyUsers.find(elem => elem.isLeader && elem.user.id === loggedUserId) ? true : false;
}

export function partyIsReady(partyUsers: Player[]): boolean {
    if (partyUsers.length === 1)
        return true;
    else if (partyUsers.length !== 2 && partyUsers.length !== 4)
        return false;
    else
        return partyUsers.find(elem => (!elem.isLeader && !elem.isReady)) ? false : true;
}

export function partyQueueString(queueTimer: QueueTimerInterface): string {
    const minutes: string = queueTimer.minutes > 0 ? `${queueTimer.minutes}:` : "";
    const seconds: string = queueTimer.seconds < 10 ? `0${queueTimer.seconds}` : `${queueTimer.seconds}`;
    return (minutes+seconds);
}