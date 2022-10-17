import axios from "axios";
import { baseUrl } from "../env";
import { replaceUserObject } from "../Redux/AuthSlice";
import { AnyAction, Dispatch } from "@reduxjs/toolkit";
import { copyChannelsArray } from "../Redux/NotificationSlice";

interface BlockParameters {
    readonly senderId: number,
    readonly token: string,
    dispatch: Dispatch<AnyAction>
}

export function fetchOnBlockUser({senderId, token, dispatch}: BlockParameters) {
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
        console.log(response);
        dispatch(copyChannelsArray(response.data));
    })
    .catch(err => {
        console.log(err);
    })
}