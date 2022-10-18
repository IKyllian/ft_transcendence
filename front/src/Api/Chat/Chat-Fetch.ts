import axios from "axios";
import { baseUrl } from "../../env";
import { Channel, ChannelsInterfaceFront, Conversation, ConversationInterfaceFront } from "../../Types/Chat-Types";
import { copyChannelsArray, copyPrivateConvArray, addPrivateConv } from "../../Redux/ChatSlice";
import { getSecondUserIdOfPM } from "../../Utils/Utils-Chat";
import { Dispatch, AnyAction } from "@reduxjs/toolkit";
import { NavigateFunction } from "react-router-dom";

export async function fetchUserChannels(token: string, channelId: number | undefined, dispatch: Dispatch<AnyAction>): Promise<void> {
    await axios.get(`${baseUrl}/channel/my_channels`, {
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    })
    .then((response) => {
        const channelArray: Channel[] = response.data;
        let datasArray: ChannelsInterfaceFront[] = [];

        channelArray.forEach((elem: Channel) => {
            datasArray.push({
                channel: {id: elem.id, name: elem.name, option: elem.option},
                isActive: "false",
            });
        })

        if (channelId !== undefined) {
            datasArray.find(elem => {
                if (elem.channel.id === channelId)
                    elem.isActive = "true";
            })
        }
        dispatch(copyChannelsArray(datasArray));
    }).catch(err => {
        console.log(err);
    })
}

export async function fetchUserConvs(token: string, dispatch: Dispatch<AnyAction>): Promise<void> {
   await axios.get(`${baseUrl}/conversation`, {
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    })
    .then((response) => {
        const convArray: Conversation[] = response.data;
        let datasArray: ConversationInterfaceFront[] = [];
        
        convArray.forEach(elem => {
            datasArray.push({
                conversation: {id: elem.id, user1: elem.user1, user2: elem.user2},
                isActive: "false",
            });
        })
        dispatch(copyPrivateConvArray(datasArray));
    }).catch(err => {
        console.log(err);
    })
}

export async function fetchConvAndRedirect(
        loggedUserId: number,
        userIdToSend: number,
        token: string,
        privateConvs: ConversationInterfaceFront[],
        dispatch: Dispatch<AnyAction>,
        navigate: NavigateFunction
    ): Promise<void>{

    await axios.get(`${baseUrl}/conversation/${userIdToSend}`, {
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    })
    .then(response => {
        if (!privateConvs?.find(elem => elem.conversation.id === response.data.id))
            dispatch(addPrivateConv({isActive: 'false', conversation: {id: response.data.id, user1: response.data.user1, user2: response.data.user2}}));
        let conv: Conversation = response.data;
        conv.messages.forEach(elem => elem.send_at = new Date(elem.send_at));
        navigate(`/chat/private-message/${getSecondUserIdOfPM(response.data, loggedUserId)}`, {state: {conv: conv}});
    })
    .catch(err => {
        console.log(err);
    })
}

export function fetchVisibleChannels(token: string, setChannelsList: Function) {
    axios.get(`${baseUrl}/channel/search`, {
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    })
    .then((response) => {
        console.log(response);
        setChannelsList([...response.data]);
    })
    .catch((err) => {
        console.log(err);
    })
}

export function fetchPrivateConvDatas(convId: number, token: string, setConvDatas: Function) {
    axios.get(`${baseUrl}/conversation/${convId}`, {
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    })
    .then(response => {
        console.log(response);
        let conv: Conversation = response.data;
        conv.messages.forEach(elem => elem.send_at = new Date(elem.send_at));
        setConvDatas(conv);
    })
    .catch(err => {
        console.log(err);
    })
}