import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ChannelsInterfaceFront, ConversationInterfaceFront } from '../Types/Chat-Types';
import { getSecondUserIdOfPM } from "../Utils/Utils-Chat"

interface ChannelState {
    channels?: ChannelsInterfaceFront[],
    privateConv?: ConversationInterfaceFront[],
    loading: boolean,
    error?: string,
}

const defaultState: ChannelState = {
    channels: undefined,
    privateConv: undefined,
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
        copyPrivateConvArray: (state, {payload}: PayloadAction<ConversationInterfaceFront[]>) => {
            state.privateConv = [...payload];
        },
        addChannel: (state, {payload}: PayloadAction<ChannelsInterfaceFront>) => {
            if (state.channels)
                state.channels = [...state.channels, payload];
            else
                state.channels = [payload];
        },
        addPrivateConv: (state, {payload}: PayloadAction<ConversationInterfaceFront>) => {
            if (state.privateConv)
                state.privateConv = [...state.privateConv, payload];
            else
                state.privateConv = [payload];
        },
        removeChannel: (state, {payload}: PayloadAction<number>) => {
            if (state.channels) {                
                state.channels = state.channels.filter(elem => elem.channel.id !== payload);
            }
        },
        removePrivateConv: (state, {payload}: PayloadAction<number>) => {
            if (state.privateConv) {                
                state.privateConv = state.privateConv.filter(elem => elem.conversation.id !== payload);
            }
        },
        changeActiveElement: (state, {payload}: PayloadAction<{id: number, isChannel: boolean}>) => {
            if ((payload.isChannel && state.channels)) {
                state.channels = [...state.channels].map(elem => {
                    if (payload.id === elem.channel.id)
                        return {...elem, isActive: 'true'};
                    else if (elem.isActive === 'true' && elem.channel.id !== payload.id)
                        return {...elem, isActive: 'false'}
                    return elem;
                });
                if (state.privateConv) {
                    state.privateConv = [...state.privateConv].map(elem => {
                        if (elem.isActive === 'true')
                            elem.isActive = 'false';
                        return elem;
                    });
                }
            } else if ((!payload.isChannel && state.privateConv)) {
                state.privateConv = [...state.privateConv].map(elem => {
                    if (payload.id ===  elem.conversation.id)
                        return {...elem, isActive: 'true'};
                    else if (elem.isActive === 'true' && elem.conversation.id !== payload.id)
                        return {...elem, isActive: 'false'}
                    return elem;
                });
                if (state.channels) {
                    state.channels = [...state.channels].map(elem => {
                        if (elem.isActive === 'true')
                            elem.isActive = 'false';
                        return elem;
                    });
                }
            }
        }
    }
});

export const {
    loadingDatas,
    copyChannelsArray,
    copyPrivateConvArray,
    addChannel,
    addPrivateConv,
    removeChannel,
    removePrivateConv,
    changeActiveElement,
} = chatSlice.actions;