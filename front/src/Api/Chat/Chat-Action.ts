import { AnyAction, Dispatch } from "@reduxjs/toolkit";
import axios from "axios";
import { NavigateFunction } from "react-router-dom";
import { baseUrl } from "../../env";
import { addChannel } from "../../Redux/ChatSlice";

type BodyRequest = {
    name: string,
    option: string,
    password?: string,
}

export function fetchJoinChannel(channelId: number, body: {password?: string}, token: string, dispatch: Dispatch<AnyAction>, navigate: NavigateFunction) {
    axios.post(`${baseUrl}/channel/${channelId}/join`, body, {
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    })
    .then((response) => {
        console.log(response);
        dispatch(addChannel({channel: response.data, isActive: 'false'}));
        navigate(`/chat/channel/${response.data.id}`);
    })
    .catch((err) => {
        console.log(err);
    })
}

export function fetchCreateChannel(body: BodyRequest, token: string, dispatch: Dispatch<AnyAction>, navigate: NavigateFunction, onCloseModal: Function) {
    axios.post(`${baseUrl}/channel`, body, {
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    })
    .then((response) => {
       console.log(response);
       dispatch(addChannel({channel: response.data, isActive: "false"}));
       onCloseModal();
       navigate(`/chat/channel/${response.data.id}`);
    }).catch(err => {
        console.log(err);
    })
}

export function fetchLeaveChannel(channelId: number, token: string, navigate: NavigateFunction) {
    axios.post(`${baseUrl}/channel/${channelId}/leave`, {}, {
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    })
    .then((response) => {
        navigate("/chat");
    })
    .catch((err) => {
        console.log(err);
    })
}