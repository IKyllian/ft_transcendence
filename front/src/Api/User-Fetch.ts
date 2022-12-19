import { replaceUserObject } from "../Redux/AuthSlice";
import { AnyAction, Dispatch } from "@reduxjs/toolkit";
import { copyNotificationArray } from "../Redux/NotificationSlice";
import { copyFriendListArray } from "../Redux/AuthSlice";
import { UserInterface } from "../Types/User-Types";
import api from "./Api";
import { baseUrl } from "../env";
import { fetchResponseAvatar } from "./Profile/Profile-Fetch";

interface BlockParameters {
    readonly senderId: number,
    dispatch: Dispatch<AnyAction>
    time?: number,
}

interface UsersListInterface {
    user: UserInterface,
    relationStatus?: string,
}


export function fetchOnBlockUser({senderId, dispatch, time}: BlockParameters) {
    api.post(`/users/${senderId}/block`, {})
    .then((response) => {
        dispatch(replaceUserObject(response.data));
    })
    .catch((err) => {
        console.log(err);
    })
}

export function fetchOnUnblockUser({senderId, dispatch}: BlockParameters) {
    api.post(`/users/${senderId}/deblock`, {})
    .then((response) => {
        dispatch(replaceUserObject(response.data));
    })
    .catch((err) => {
        console.log(err);
    })
}

export function fetchNotifications(dispatch: Dispatch<AnyAction>) {
    api.get(`/notification`)
    .then(response => {
        console.log("Notification", response);
        dispatch(copyNotificationArray(response.data));
    })
    .catch(err => {
        console.log(err);
    })
}

export function fetchFriendList(dispatch: Dispatch<AnyAction>) {
    api.get(`/friend`)
    .then(response => {
        console.log(response);
        dispatch(copyFriendListArray(response.data));
    })
    .catch(err => {
        console.log(err);
    })
}

export function fetchSearchAllUsers(inputText: string, setUsersList: Function) {
    api.post(`/users/search`, {str: inputText})
    .then((response) => {
        const newArray: UsersListInterface[] = response.data.map((elem: UserInterface) => { return {user: elem}});
        setUsersList(newArray);
    })
    .catch((err) => {
        console.log(err);
    })
}

export function fetchSearchUsersToAdd(inputText: string, setUsersList: Function) {
    api.post(`/friend/search`, {str: inputText})
    .then(response => {
        console.log("Response Search", response);
        const newArray: UsersListInterface[] = response.data.map((elem: any) => { return {user: elem.user, relationStatus: elem.relationStatus}});
        setUsersList(newArray);
    })
    .catch(err => {
        console.log(err);
    })
}

export async function fetchIsAlreadyInGame(): Promise<boolean> {
    let isInGame: boolean = false;
   await api.get(`/game/is-playing`)
    .then(response => {
        console.log("response", response.data);
        isInGame = response.data;
    })
    .catch(err => {
        console.log(err);
    })
    return isInGame;
}

export async function getPlayerAvatar(cache: Cache | null, token: string, userId: number, userAvatar: string): Promise<string | undefined> {
    const req = new Request(`${baseUrl}/users/${userId}/avatar`, {method: 'GET', headers: {"Authorization": `Bearer ${token}`}});
    let avatarResponse: Response | undefined;
    let headerFileName: string | null = null;
    if (cache !== null) {
        avatarResponse = await cache.match(req).then(async (cacheResponse) => {
            if (cacheResponse) {
                headerFileName = cacheResponse.headers.get("Content-Disposition");
                return cacheResponse;
            } else {
                return await fetchResponseAvatar(req).then(fetchResponse => {
                    // console.log("fetchResponse", fetchResponse);
                    console.log('Response Headers:', fetchResponse.headers);
                    if (!fetchResponse.ok)
                        return undefined;
                    headerFileName = fetchResponse.headers.get("Content-Disposition");
                    cache.put(req, fetchResponse.clone());
                    return fetchResponse;
                })
            }
        })
    } else {
        avatarResponse = await fetchResponseAvatar(req).then(fetchResponse => {
            if (!fetchResponse.ok)
                return undefined;
            headerFileName = fetchResponse.headers.get("Content-Disposition");
            return fetchResponse;
        })
    }
    if (headerFileName !== null && userAvatar.match("base64") === null && headerFileName !== userAvatar) {
        console.log("NEED TO UPDATE CACHE");
        return await updatePlayerAvatar(cache, token, userId);
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
    const req = new Request(`${baseUrl}/users/${userId}/avatar`, {method: 'GET', headers: {"Authorization": `Bearer ${token}`}});
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