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

        channelArray.forEach(elem => {
            datasArray.push({
                channel: elem,
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
                conversation: elem,
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
            dispatch(addPrivateConv({isActive: 'false', conversation: response.data}));
        navigate(`/chat/private-message/${getSecondUserIdOfPM(response.data, loggedUserId)}`);
    })
    .catch(err => {
        console.log(err);
    })
}
