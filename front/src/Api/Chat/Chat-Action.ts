import { AnyAction, Dispatch } from "@reduxjs/toolkit";
import axios from "axios";
import { Channel } from "diagnostics_channel";
import { UseFormSetError } from "react-hook-form";
import { NavigateFunction } from "react-router-dom";
import { Socket } from "socket.io-client";
import { baseUrl } from "../../env";
import { replaceChannelMessages } from "../../Redux/ChannelSlice";
import { addChannel } from "../../Redux/ChatSlice";
import { ChatMessage, PreviousMessagesState, CreateChanBodyRequest, PrivateMessage, Conversation, ConversationState } from "../../Types/Chat-Types";
import { UserInterface } from "../../Types/User-Types";

type FormValues = {
    chanMode: string,
    chanName: string,
    password?: string,
    usersIdInvited?: string[];
}

export function fetchCreateChannel(
    body: CreateChanBodyRequest,
    usersInvited: UserInterface[] | undefined,
    token: string,
    dispatch: Dispatch<AnyAction>,
    navigate: NavigateFunction,
    onCloseModal: Function,
    socket: Socket,
    setError: UseFormSetError<FormValues>) {
    
    axios.post(`${baseUrl}/channel`, body, {
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    })
    .then((response) => {
        console.log(response);
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
        setError("chanName", {message: "Channel name already exist"});
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

export function fetchLoadPrevChatMessages(channelId: number, token: string, dispatch: Dispatch<AnyAction>, currentMessages: ChatMessage[], setPreviousMessages: Function) {
    axios.post(`${baseUrl}/channel/${channelId}/messages`, {skip: currentMessages.length}, {
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    })
    .then((response) => {
        console.log("response", response.data);
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

export function fetchLoadPrevConvMessages(convId: number, token: string, setConvDatas: Function, currentMessages: PrivateMessage[], setPreviousMessages: Function) {
    axios.post(`${baseUrl}/conversation/${convId}/messages`, {skip: currentMessages.length}, {
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    })
    .then((response) => {
        console.log("response", response.data);
        if (response.data.length > 0) {
            setConvDatas((prev: ConversationState) => { return {...prev, conv: {...prev.conv, messages: [...response.data, ...prev.conv.messages]}}});
        } else {
            setPreviousMessages({loadPreviousMessages: false, reachedMax: true});
        }
        
    })
    .catch((err) => {
        console.log(err);
    })
}