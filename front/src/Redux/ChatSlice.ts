import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ChannelsInterfaceFront } from '../Types/Chat-Types';

interface ChannelState {
    channels?: ChannelsInterfaceFront[],
    loading: boolean,
    error?: string,
}

const defaultState: ChannelState = {
    channels: undefined,
    loading: false,
    error: undefined,
}

export const chatSlice = createSlice({
    name: 'chat',
    initialState: defaultState,
    reducers: {
        loadingDatas: (state) => {
            state.loading = true;
        },
        copyChannelsArray: (state, {payload}: PayloadAction<ChannelsInterfaceFront[]>) => {
            state.channels = [...payload];
        },
        addChannel: (state, {payload}: PayloadAction<ChannelsInterfaceFront>) => {
            if (state.channels)
                state.channels = [...state.channels, payload];
            else
                state.channels = [payload];
        },
        removeChannel: (state, {payload}: PayloadAction<number>) => {
            if (state.channels) {                
                state.channels = state.channels.filter(elem => elem.channel.id !== payload);
            }
        },
        changeActiveElement: (state, {payload}: PayloadAction<number>) => {
            if (state.channels) {
                const newArray: ChannelsInterfaceFront[] = state.channels.map(elem => {
                    if (payload === elem.channel.id)
                        return {...elem, isActive: 'true'};
                    else if (elem.isActive === 'true' && elem.channel.id !== payload)
                        return {...elem, isActive: 'false'}
                    return elem;
                })
                state.channels = newArray;
            }
        }
    }
});

export const { loadingDatas, copyChannelsArray, addChannel, removeChannel, changeActiveElement } = chatSlice.actions;