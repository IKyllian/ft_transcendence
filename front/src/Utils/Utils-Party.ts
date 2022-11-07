import { Player } from "../Types/Lobby-Types";

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