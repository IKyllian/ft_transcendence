import axios from "axios";
import { baseUrl } from "../env";
import { replaceUserObject } from "../Redux/AuthSlice";
import { AnyAction, Dispatch } from "@reduxjs/toolkit";
import { copyNotificationArray } from "../Redux/NotificationSlice";
import { copyFriendListArray } from "../Redux/AuthSlice";
import { executionAsyncResource } from "async_hooks";
import { UserInterface } from "../Types/User-Types";

interface BlockParameters {
    readonly senderId: number,
    readonly token: string,
    dispatch: Dispatch<AnyAction>
    time?: number,
}

interface UsersListInterface {
    user: UserInterface,
    relationStatus?: string,
}


export function fetchOnBlockUser({senderId, token, dispatch, time}: BlockParameters) {
    axios.post(`${baseUrl}/users/${senderId}/block`, {}, {
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    })
    .then((response) => {
        dispatch(replaceUserObject(response.data));
    })
    .catch((err) => {
        console.log(err);
    })
}

export function fetchOnUnblockUser({senderId, token, dispatch}: BlockParameters) {
    axios.post(`${baseUrl}/users/${senderId}/deblock`, {}, {
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    })
    .then((response) => {
        dispatch(replaceUserObject(response.data));
    })
    .catch((err) => {
        console.log(err);
    })
}

export function fetchNotifications(token: string, dispatch: Dispatch<AnyAction>) {
    axios.get(`${baseUrl}/notification`, {
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    })
    .then(response => {
        console.log("Notification", response);
        dispatch(copyNotificationArray(response.data));
    })
    .catch(err => {
        console.log(err);
    })
}

export function fetchFriendList(token: string, dispatch: Dispatch<AnyAction>) {
    axios.get(`${baseUrl}/friend`, {
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    })
    .then(response => {
        console.log(response);
        dispatch(copyFriendListArray(response.data));
    })
    .catch(err => {
        console.log(err);
    })
}

export function fetchSearchAllUsers(inputText: string, token :string, setUsersList: Function) {
    axios.post(`${baseUrl}/users/search`, {str: inputText}, {
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    })
    .then((response) => {
        const newArray: UsersListInterface[] = response.data.map((elem: UserInterface) => { return {user: elem}});
        setUsersList(newArray);
    })
    .catch((err) => {
        console.log(err);
    })
}

export function fetchSearchUsersToAdd(inputText: string, token :string, setUsersList: Function) {
    axios.post(`${baseUrl}/friend/search`, {str: inputText}, {
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    })
    .then(response => {
        const newArray: UsersListInterface[] = response.data.map((elem: any) => { return {user: elem.user, relationStatus: elem.relationStatus}});
        setUsersList(newArray);
    })
    .catch(err => {
        console.log(err);
    })
}