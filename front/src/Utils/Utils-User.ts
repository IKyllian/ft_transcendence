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

export async function getPlayerAvatar(cache: Cache | null, token: string, userId: number, userAvatar: string): Promise<string | undefined> {
    let req = new Request(`${baseUrl}/users/${userId}/avatar`, {method: 'GET', headers: {"Authorization": `Bearer ${token}`}});
    console.log("req", req);
    let avatarResponse: Response | undefined;
    if (cache !== null) {
        avatarResponse = await cache.match(req).then(async (cacheResponse) => {
            // console.log("cacheResponse", cacheResponse);
            if (cacheResponse) {
                return cacheResponse;
            } else 
                return await fetchResponseAvatar(req).then(fetchResponse => {
                    if (!fetchResponse.ok)
                        return undefined;
                    cache.put(req, fetchResponse.clone());
                    return fetchResponse;
                })
        })
    } else {
        avatarResponse = await fetchResponseAvatar(req).then(fetchResponse => {
            if (!fetchResponse.ok)
                return undefined;
            return fetchResponse;
        })
    }
    if (avatarResponse !== undefined) {
        const avatarBlob = await avatarResponse.blob();
        if (avatarBlob) 
            return URL.createObjectURL(avatarBlob);
        return undefined;
    }
    return undefined;
}

export async function updatePlayerAvatar(cache: Cache | null, token: string, userId: number): Promise<string | undefined> {
    let req = new Request(`${baseUrl}/users/${userId}/avatar`, {method: 'GET', headers: {"Authorization": `Bearer ${token}`}});
    console.log("req", req);
    let avatarResponse: Response | undefined;
    if (cache !== null) {
        cache.delete(req);
        avatarResponse = await fetchResponseAvatar(req).then(fetchResponse => {
            if (!fetchResponse.ok)
                return undefined;
            cache.put(req, fetchResponse.clone());
            return fetchResponse;
        })
        if (avatarResponse !== undefined) {
            const avatarBlob = await avatarResponse.blob();
            if (avatarBlob) 
                return URL.createObjectURL(avatarBlob);
            return undefined;
        }
    }
    return undefined;
}