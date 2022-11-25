import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Channel, ChannelUser, UserTimeout, ChatMessage } from '../Types/Chat-Types';
import { UserStatus } from '../Types/User-Types';

interface ChannelState {
    channelDatas: Channel | undefined,
    loggedUserIsOwner: boolean,
    loading: boolean,
    currentChannelId: number | undefined,
}

const defaultState: ChannelState = {
    channelDatas: undefined,
    loggedUserIsOwner: false,
    loading: false,
    currentChannelId: undefined,
}

export const channelSlice = createSlice({
    name: 'channel',
    initialState: defaultState,
    reducers: {
        loadingChannelDatas: (state) => {
            state.loading = true;
        },
        setChannelDatas: (state, {payload}: PayloadAction<{channel: Channel, loggedUserId: number}>) => {
            if (payload.channel.channelUsers.find((elem) => elem.user.id === payload.loggedUserId && (elem.role === "owner" || elem.role === "moderator")))
                state.loggedUserIsOwner = true;
            state.channelDatas =  payload.channel;
            state.loading = false;
        },
        addChannelUser: (state, {payload}: PayloadAction<ChannelUser>) => {
            if (state.channelDatas)
                state.channelDatas.channelUsers = [...state.channelDatas.channelUsers, payload];
        },
        removeChannelUser: (state, {payload}: PayloadAction<number>) => {
            if (state.channelDatas)
                state.channelDatas.channelUsers = [...state.channelDatas.channelUsers.filter((elem: ChannelUser) => elem.id !== payload)];
        },
        banChannelUser: (state, {payload}: PayloadAction<UserTimeout>) => {
            if (state.channelDatas) {
                state.channelDatas.usersTimeout = [...state.channelDatas.usersTimeout, payload];
                state.channelDatas.channelUsers = [...state.channelDatas.channelUsers.filter((elem: ChannelUser) => elem.user.id !== payload.user.id)]
            }
                
        },
        muteChannelUser: (state, {payload}: PayloadAction<UserTimeout>) => {
            if (state.channelDatas)
                state.channelDatas.usersTimeout = [...state.channelDatas.usersTimeout, payload];
        },
        removeTimeoutChannelUser: (state, {payload}: PayloadAction<number>) => {
            if (state.channelDatas)
                state.channelDatas.usersTimeout = [...state.channelDatas.usersTimeout.filter((elem: UserTimeout) => elem.id !== payload)];
        },
        updateChannelUser: (state, {payload}: PayloadAction<ChannelUser>) => {
            if (state.channelDatas) {
                state.channelDatas.channelUsers = [...state.channelDatas.channelUsers.map((elem: ChannelUser) => {
                    if (elem.user.id === payload.user.id)
                        return elem = payload;
                    return elem
                })]
            }
        },
        updateChannelUserStatus: (state, {payload}: PayloadAction<{id: number, status: UserStatus}>) => {
            if (state.channelDatas) {
                state.channelDatas.channelUsers = [...state.channelDatas.channelUsers.map((elem: ChannelUser) => {
                    if (elem.user.id === payload.id)
                        return {...elem, user: {...elem.user, status: payload.status}};
                    return elem;
                })];
            }
        },
        addChannelMessage: (state, {payload}: PayloadAction<ChatMessage>) => {
            if (state.channelDatas)
                state.channelDatas.messages = [...state.channelDatas.messages, {...payload}];
        },
        replaceChannelMessages: (state, {payload}: PayloadAction<ChatMessage[]>) => {
            if (state.channelDatas)
                state.channelDatas.messages = payload;
        },
        unsetChannelDatas: (state) => {
            state.channelDatas = undefined;
            state.loggedUserIsOwner = false;
            state.loading = true;
        },
        setChannelId: (state, {payload}: PayloadAction<number>) => {
            state.currentChannelId = payload;
        },
        unsetChannelId: (state) => {
            state.currentChannelId = undefined;
        }
    }
});

export const {
    loadingChannelDatas,
    setChannelDatas,
    addChannelUser,
    removeChannelUser,
    banChannelUser,
    muteChannelUser,
    removeTimeoutChannelUser,
    updateChannelUser,
    updateChannelUserStatus,
    unsetChannelDatas,
    setChannelId,
    addChannelMessage,
    replaceChannelMessages,
    unsetChannelId,
} = channelSlice.actions;