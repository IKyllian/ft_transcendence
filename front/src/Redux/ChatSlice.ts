import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ChannelsInterfaceFront, ConversationInterfaceFront, ChannelInfoSidebar } from '../Types/Chat-Types';

interface ChatState {
    channels: ChannelsInterfaceFront[],
    privateConv: ConversationInterfaceFront[],
    loading: boolean,
    error?: string,
}

const defaultState: ChatState = {
    channels: [],
    privateConv: [],
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
        copyChannelsAndConvs: (state, {payload} : PayloadAction<{channels: ChannelsInterfaceFront[], convs: ConversationInterfaceFront[]}>) => {
            state.channels = [...payload.channels];
            state.privateConv = [...payload.convs];
        },
        copyChannelsArray: (state, {payload}: PayloadAction<ChannelsInterfaceFront[]>) => {
            state.channels = [...payload];
        },
        copyPrivateConvArray: (state, {payload}: PayloadAction<ConversationInterfaceFront[]>) => {
            state.privateConv = [...payload];
        },
        updateChannel: (state, {payload}: PayloadAction<ChannelInfoSidebar>) => {
            if (state.channels) {
                const index: number = state.channels.findIndex(elem => elem.channel.id === payload.id);
                if (index >= 0)
                    state.channels[index].channel = {...payload};
            }
        },
        addChannel: (state, {payload}: PayloadAction<ChannelsInterfaceFront>) => {
            if (state.channels && !state.channels.find(elem => elem.channel.id === payload.channel.id))
                state.channels = [...state.channels, payload];
            else
                state.channels = [payload];
        },
        addPrivateConv: (state, {payload}: PayloadAction<ConversationInterfaceFront>) => {
            if (state.privateConv && !state.privateConv.find(elem => elem.conversation.id === payload.conversation.id))
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
        changePrivateConvOrder: (state, {payload}: PayloadAction<number>) => {
            if (state.privateConv.length > 1) {
                const idx = state.privateConv.findIndex(elem => elem.conversation.id === payload);
                state.privateConv.splice(0, 0, state.privateConv.splice(idx, 1)[0]);
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
        },
        resetActiveElement: (state) => {
            const activeChan : ChannelsInterfaceFront | undefined = state.channels.find(elem => elem.isActive === 'true');
            if (activeChan)
                activeChan.isActive = 'false';
            else {
                const activeConv : ConversationInterfaceFront | undefined = state.privateConv.find(elem => elem.isActive === 'true');
                if (activeConv)
                    activeConv.isActive = 'false';
            }
        },
        resetChat: () => defaultState,
    }
});

export const {
    loadingDatas,
    copyChannelsAndConvs,
    copyChannelsArray,
    copyPrivateConvArray,
    updateChannel,
    addChannel,
    addPrivateConv,
    removeChannel,
    removePrivateConv,
    changePrivateConvOrder,
    changeActiveElement,
    resetActiveElement,
    resetChat,
} = chatSlice.actions;