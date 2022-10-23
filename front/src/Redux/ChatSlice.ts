import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ChannelsInterfaceFront, ConversationInterfaceFront, ChannelInfoSidebar } from '../Types/Chat-Types';
import { UserInterface } from '../Types/User-Types';

interface ChannelState {
    channels: ChannelsInterfaceFront[],
    privateConv: ConversationInterfaceFront[],
    loading: boolean,
    error?: string,
}

const defaultState: ChannelState = {
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
            if (state.channels)
                state.channels = [...state.channels, payload];
            else
                state.channels = [payload];
            console.log("state.channels", state.channels);
        },
        addPrivateConv: (state, {payload}: PayloadAction<ConversationInterfaceFront>) => {
            // const tempConvExist: ConversationInterfaceFront | undefined = !state.privateConv ? undefined : state.privateConv.find(elem => (elem.conversation.user1.id === payload.receiverId || elem.conversation.user2.id === payload.receiverId));
            // console.log("tempConvExist", tempConvExist);
            // console.log("receiverId", payload.receiverId);
            // console.log("Before state.privateConv", state.privateConv);
            // if (tempConvExist)  {
                // console.log("CONDITION OUI");
            //     state.privateConv = state.privateConv?.filter(elem => elem.conversation.id !== tempConvExist.conversation.id);
            // }
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
    copyChannelsAndConvs,
    copyChannelsArray,
    copyPrivateConvArray,
    updateChannel,
    addChannel,
    addPrivateConv,
    removeChannel,
    removePrivateConv,
    changeActiveElement,
} = chatSlice.actions;