import { replaceUserObject } from "../Redux/AuthSlice";
import { AnyAction, Dispatch } from "@reduxjs/toolkit";
import { copyNotificationArray } from "../Redux/NotificationSlice";
import { copyFriendListArray } from "../Redux/AuthSlice";
import { UserInterface } from "../Types/User-Types";
import api from "./Api";

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
        const newArray: UsersListInterface[] = response.data.map((elem: any) => { return {user: elem.user, relationStatus: elem.relationStatus}});
        setUsersList(newArray);
    })
    .catch(err => {
        console.log(err);
    })
}