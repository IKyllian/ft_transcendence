import axios from "axios";
import { baseUrl } from "../env";
import { replaceUserObject } from "../Redux/AuthSlice";
import { AnyAction, Dispatch } from "@reduxjs/toolkit";

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