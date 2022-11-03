import { GameUser } from "../Types/Lobby-Types";

export function loggedUserIsLeader(loggedUserId: number, partyUsers: GameUser[]): boolean {
    return partyUsers.find(elem => elem.isLeader && elem.user.id === loggedUserId) ? true : false;
}

export function partyIsReady(partyUsers: GameUser[]): boolean {
    return partyUsers.find(elem => (!elem.isLeader && !elem.isReady)) ? false : true;
}