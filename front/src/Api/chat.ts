import { useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { baseUrl } from "../env";
import { useAppDispatch, useAppSelector } from "../Redux/Hooks";
import { loadingDatas, copyChannelsArray, changeActiveElement } from "../Redux/ChatSlice"
import { ChannelsInterfaceFront, Channel } from "../Types/Chat-Types";

const dispatch = useAppDispatch();
const authDatas = useAppSelector((state) => state.auth);
const params = useParams();

// export const getUserChannels = (useEffect(() => {
//     dispatch(loadingDatas());
//     axios.get(`${baseUrl}/channel/my_channels`, {
//         headers: {
//             "Authorization": `Bearer ${authDatas.token}`,
//         }
//     })
//     .then((response) => {
//         const newArray: ChannelsInterfaceFront[] = response.data.map((elem: Channel) => {
//             if (parseInt(params.chatId!, 10) === elem.id)
//                 return {...elem, isActive: 'true'};
//             return {isActive: parseInt(params.chatId!, 10) === elem.id ? 'true' : 'false', channel: {...elem}};
//         })
//         dispatch(copyChannelsArray(newArray));
//     }).catch(err => {
//         console.log(err);
//     })
// }, []))

export function getUserChannels() {
    dispatch(loadingDatas());
    axios.get(`${baseUrl}/channel/my_channels`, {
        headers: {
            "Authorization": `Bearer ${authDatas.token}`,
        }
    })
    .then((response) => {
        const newArray: ChannelsInterfaceFront[] = response.data.map((elem: Channel) => {
            if (parseInt(params.chatId!, 10) === elem.id)
                return {...elem, isActive: 'true'};
            return {isActive: parseInt(params.chatId!, 10) === elem.id ? 'true' : 'false', channel: {...elem}};
        })
        dispatch(copyChannelsArray(newArray));
    }).catch(err => {
        console.log(err);
    })
}