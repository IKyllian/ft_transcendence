import { AnyAction, Dispatch } from "@reduxjs/toolkit";
import axios from "axios";
import { Channel } from "diagnostics_channel";
import { NavigateFunction } from "react-router-dom";
import { Socket } from "socket.io-client";
import { baseUrl } from "../../env";
import { addChannel } from "../../Redux/ChatSlice";
import { UserInterface } from "../../Types/User-Types";

type BodyRequest = {
    name: string,
    option: string,
    password?: string,
}

export function fetchCreateChannel(
    body: BodyRequest,
    usersInvited: UserInterface[] | undefined,
    token: string,
    dispatch: Dispatch<AnyAction>,
    navigate: NavigateFunction,
    onCloseModal: Function,
    socket: Socket) {
    
    axios.post(`${baseUrl}/channel`, body, {
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    })
    .then((response) => {
        console.log(response);
        dispatch(addChannel({channel: response.data, isActive: "false"}));
        if (usersInvited) {
            usersInvited.forEach(element => {
                socket?.emit("ChannelInvite", {
                    chanId: response.data.id,
                    userId: element.id,
                });
            });
        }
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