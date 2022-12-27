import { AnyAction, Dispatch } from "@reduxjs/toolkit";
import { UseFormSetError } from "react-hook-form";
import { NavigateFunction } from "react-router-dom";
import { Socket } from "socket.io-client";
import { replaceChannelMessages } from "../../Redux/ChannelSlice";
import { addChannel } from "../../Redux/ChatSlice";
import { loadNewMessages } from "../../Redux/PrivateConvSlice";
import { ChatMessage, CreateChanBodyRequest, PrivateMessage } from "../../Types/Chat-Types";
import { UserInterface } from "../../Types/User-Types";
import api from "../Api";

type FormValues = {
    chanMode: string,
    chanName: string,
    password?: string,
    usersIdInvited?: string[];
}

export function fetchCreateChannel(
    body: CreateChanBodyRequest,
    usersInvited: UserInterface[] | undefined,
    dispatch: Dispatch<AnyAction>,
    navigate: NavigateFunction,
    onCloseModal: Function,
    socket: Socket,
    setError: UseFormSetError<FormValues>) {
    
    api.post(`/channel`, body)
    .then((response) => {
        dispatch(addChannel({channel: response.data, isActive: "true"}));
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
        if (err && err.response && err.response.data && err.response.data.message)
            setError("chanName", {message: err.response.data.message});
        else
            setError("chanName", {message: "Channel name already exist or invalid"});
    })
}

export function fetchLeaveChannel(channelId: number, navigate: NavigateFunction) {
    api.post(`/channel/${channelId}/leave`, {})
    .then((response) => {
        navigate("/chat");
    })
    .catch((err) => {
        console.log(err);
    })
}

export function fetchLoadPrevChatMessages(channelId: number, dispatch: Dispatch<AnyAction>, currentMessages: ChatMessage[], setPreviousMessages: Function) {
    api.post(`/channel/${channelId}/messages`, {skip: currentMessages.length})
    .then((response) => {
        if (response.data.length > 0) {
            dispatch(replaceChannelMessages([...response.data, ...currentMessages]));
        } else {
            setPreviousMessages({loadPreviousMessages: false, reachedMax: true});
        }
        
    })
    .catch((err) => {
        console.log(err);
    })
}

export function fetchLoadPrevConvMessages(convId: number, dispatch: Dispatch<AnyAction>, currentMessages: PrivateMessage[], setPreviousMessages: Function) {
    api.post(`/conversation/${convId}/messages`, {skip: currentMessages.length})
    .then((response) => {
        if (response.data.length > 0) {
            dispatch(loadNewMessages(response.data));
        } else {
            setPreviousMessages({loadPreviousMessages: false, reachedMax: true});
        }  
    })
    .catch((err) => {
        console.log(err);
    })
}