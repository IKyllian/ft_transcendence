import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Channel, ChannelUser, UserTimeout, ChatMessage, ChannelModes } from '../Types/Chat-Types';
import { UserStatus } from '../Types/User-Types';

interface ChannelState {
    channelDatas: Channel | undefined | null,
    loggedUserIsOwner: boolean,
    loggedUserIsModerator: boolean
    loading: boolean,
    currentChannelId: number | undefined,
}

const defaultState: ChannelState = {
    channelDatas: undefined,
    loggedUserIsOwner: false,
    loggedUserIsModerator: false,
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
        channelNotfound: (state) => {
            state.channelDatas = null;
        },
        setChannelDatas: (state, {payload}: PayloadAction<{channel: Channel, loggedUserId: number}>) => {
            if (payload.channel.channelUsers.find((elem) => elem.user.id === payload.loggedUserId && (elem.role === "owner"))) {
                state.loggedUserIsOwner = true;
                state.loggedUserIsModerator = true;
            } else if (payload.channel.channelUsers.find((elem) => elem.user.id === payload.loggedUserId && (elem.role === "moderator")))
                state.loggedUserIsModerator = true;
            state.channelDatas =  payload.channel;
            state.loading = false;
        },
        changeChannelSettings:  (state, {payload}: PayloadAction<{chanName: string, option: ChannelModes}>) => {
            if (state.channelDatas)
                state.channelDatas = {...state.channelDatas, name: payload.chanName, option: payload.option};  
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
        updateChannelUser: (state, {payload}: PayloadAction<{user: ChannelUser, loggedUserId: number}>) => {
            if (state.channelDatas) {
                state.channelDatas.channelUsers = [...state.channelDatas.channelUsers.map((elem: ChannelUser) => {
                    if (elem.user.id === payload.user.user.id && payload.user.role === "owner" && payload.loggedUserId === elem.user.id)
                        state.loggedUserIsOwner = true;
                    if (elem.user.id === payload.user.user.id && payload.user.role === "moderator" && payload.loggedUserId === elem.user.id) {
                        state.loggedUserIsOwner = false;
                        state.loggedUserIsModerator = true;
                    }
                    if (elem.user.id === payload.user.user.id && payload.user.role === "clampin" && payload.loggedUserId === elem.user.id) {
                        state.loggedUserIsOwner = false;
                        state.loggedUserIsModerator = false;
                    }
                    if (elem.user.id === payload.user.user.id)
                        return elem = payload.user;
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
        updateChannelUserIngameStatus: (state, {payload}: PayloadAction<{id: number, in_game_id: string | null}>) => {
            if (state.channelDatas) {
                state.channelDatas.channelUsers = [...state.channelDatas.channelUsers.map((elem: ChannelUser) => {
                    if (elem.user.id === payload.id)
                        return {...elem, user: {...elem.user, in_game_id: payload.in_game_id}};
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
        },
        unsetOwner: (state) => {
            state.loggedUserIsOwner = false;
        },
        resetChannel: () => defaultState,
    }
});

export const {
    loadingChannelDatas,
    channelNotfound,
    setChannelDatas,
    addChannelUser,
    changeChannelSettings,
    removeChannelUser,
    banChannelUser,
    muteChannelUser,
    removeTimeoutChannelUser,
    updateChannelUser,
    updateChannelUserStatus,
    updateChannelUserIngameStatus,
    unsetChannelDatas,
    setChannelId,
    addChannelMessage,
    replaceChannelMessages,
    unsetChannelId,
    resetChannel,
    unsetOwner,
} = channelSlice.actions;