import { Player, QueueTimerInterface } from "../Types/Lobby-Types";

export function loggedUserIsLeader(loggedUserId: number, partyUsers: Player[]): boolean {
    return partyUsers.find(elem => elem.isLeader && elem.user.id === loggedUserId) ? true : false;
}

export function partyQueueString(queueTimer: QueueTimerInterface): string {
    const minutes: string = queueTimer.minutes < 10 ? `0${queueTimer.minutes}:` : `${queueTimer.minutes}`;
    const seconds: string = queueTimer.seconds < 10 ? `0${queueTimer.seconds}` : `${queueTimer.seconds}`;
    return (minutes+seconds);
}