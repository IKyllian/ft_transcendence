import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AuthState } from '../Types/User-Types';
import { LoginPayload } from '../Types/User-Types';
import { Channel, ChannelsInterfaceFront, ChatMessage } from '../Types/Chat-Types';
import { io, Socket } from 'socket.io-client';
import { baseUrl } from '../env';

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
    }
});

export const { loadingDatas, copyChannelsArray, addChannel, removeChannel } = chatSlice.actions;