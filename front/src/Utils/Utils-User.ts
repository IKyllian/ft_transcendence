import { UserInterface } from "../Types/User-Types";
import { fetchResponseAvatar } from "../Api/Profile/Profile-Fetch";
import { baseUrl } from "../env";

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

export async function getPlayerAvatar(cache: Cache, token: string): Promise<string | undefined> {
    let req = new Request(`${baseUrl}/users/avatar`, {method: 'GET', headers: {"Authorization": `Bearer ${token}`}});
    return await cache.match(req).then(async (cacheResponse) => {
        if (cacheResponse) {
            return cacheResponse;
        } else 
            return await fetchResponseAvatar(token, req).then(fetchResponse => {
                if (!fetchResponse.ok) {
                    return undefined;
                }
                cache.put(req, fetchResponse);
                return fetchResponse;
            })
    })
    .then((response) => {
        if (response)
            return response.blob();
        return undefined;
    })
    .then(blob => {
        if (blob) {
            const url = URL.createObjectURL(blob);
            return url;
        }
        return undefined;
    })
}