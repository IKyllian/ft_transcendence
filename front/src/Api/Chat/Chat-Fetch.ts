import { Channel, ChannelsInterfaceFront, Conversation, ConversationInterfaceFront } from "../../Types/Chat-Types";
import { addPrivateConv } from "../../Redux/ChatSlice";
import { Dispatch, AnyAction } from "@reduxjs/toolkit";
import { NavigateFunction } from "react-router-dom";
import { UserInterface } from "../../Types/User-Types";
import api from "../Api";

interface UsersListInterface {
    user: UserInterface,
    relationStatus?: string,
}

export async function fetchUserChannels(channelId: number | undefined): Promise<ChannelsInterfaceFront[]> {
    let datasArray: ChannelsInterfaceFront[] = [];
    await api.get(`/channel/my_channels`)
    .then((response) => {
        const channelArray: Channel[] = response.data;

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
    }).catch(err => {
        console.log(err);
    })
    return datasArray;
}

export async function fetchUserConvs(convId: number | undefined): Promise<ConversationInterfaceFront[]> {
    let datasArray: ConversationInterfaceFront[] = [];
   await api.get(`/conversation`)
    .then((response) => {
        const convArray: Conversation[] = response.data;
        
        convArray.forEach(elem => {
            datasArray.push({
                conversation: {id: elem.id, user1: elem.user1, user2: elem.user2},
                isActive: "false",
            });
        })

        if (convId !== undefined) {
            datasArray.find(elem => {
                if (elem.conversation.id === convId)
                    elem.isActive = "true";
            })
        }
    }).catch(err => {
        console.log(err);
    })
    return datasArray;
}

export async function fetchConvAndRedirect(
        loggedUser: UserInterface,
        userIdToSend: number,
        privateConvs: ConversationInterfaceFront[],
        dispatch: Dispatch<AnyAction>,
        navigate: NavigateFunction
    ): Promise<void>{
        
    await api.get(`/conversation/user/${userIdToSend}`)
    .then(response => {
        const responseDatas: Conversation | UserInterface = response.data;
        if ((responseDatas as Conversation).messages) {
            if (!privateConvs?.find(elem => elem.conversation.id === response.data.id))
                dispatch(addPrivateConv({isActive: 'false', conversation: {id: response.data.id, user1: response.data.user1, user2: response.data.user2}}));
            navigate(`/chat/private-message/${response.data.id}`, {state: {isTemp: false, conv: response.data}});
        } else {
            const tempId: number = Math.floor(Math.random() * 10000);
            navigate(`/chat/private-message/${tempId}`, {state: {isTemp: true, conv: {id: tempId, user1: loggedUser, user2: response.data, messages: []}}});
        }
    })
    .catch(err => {
        console.log(err);
    })
}

export function fetchVisibleChannels(setChannelsList: Function) {
    api.get(`/channel/search`)
    .then((response) => {
        setChannelsList([...response.data]);
    })
    .catch((err) => {
        console.log(err);
    })
}

export function fetchPrivateConvDatas(convId: number, setConvDatas: Function) {
    api.get(`/conversation/${convId}`)
    .then(response => {
        setConvDatas({temporary: false, conv: response.data});
    })
    .catch(err => {
        console.log(err);
    })
}

export function fetchSearchUsersToInvite(inputText: string, setUsersList: Function, chanId: number) {
    api.post(`/channel/users_to_invite`, {chanId: chanId, str: inputText})
    .then((response) => {
        const newArray: UsersListInterface[] = response.data.map((elem: UserInterface) => { return {user: elem}});
        setUsersList(newArray);   
    })
    .catch((err) => {
        console.log(err);
    })
}