import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Conversation, ConversationState, PrivateMessage } from '../Types/Chat-Types';
import { UserStatus } from '../Types/User-Types';

interface PrivateConvState {
    convDatas: ConversationState | undefined,
    loading: boolean,
}

const defaultState: PrivateConvState = {
    convDatas: undefined,
    loading: true,
}

export const privateConvSlice = createSlice({
    name: 'privateConv',
    initialState: defaultState,
    reducers: {
        convNotFound: (state) => {
            state.loading = false;
        },
        setConv: (state, {payload}: PayloadAction<{conv: Conversation, temp: boolean}>) => {
            state.convDatas = {conv: payload.conv, temporary: payload.temp}
            state.loading = false;
        },
        resetConvState: (state) => {
            state.loading = true;
            state.convDatas = undefined;
        },
        addNewMessage: (state, {payload}: PayloadAction<PrivateMessage>) => {
            if (state.convDatas) {
                state.convDatas.conv.messages = [...state.convDatas.conv.messages, payload];
            }
        },
        loadNewMessages: (state, {payload}: PayloadAction<PrivateMessage[]>) => {
            if (state.convDatas) {
                state.convDatas.conv.messages = [...payload, ...state.convDatas.conv.messages]
            }
        },
        changeUserStatus: (state, {payload}: PayloadAction<{id: number, status: UserStatus}>) => {
            if (state.convDatas) {
                if (state.convDatas.conv.user1.id === payload.id) {
                    state.convDatas.conv.user1 = {...state.convDatas.conv.user1, status: payload.status};
                } else if (state.convDatas.conv.user2.id === payload.id) {
                    state.convDatas.conv.user1 = {...state.convDatas.conv.user2, status: payload.status};
                }
            }
        }
    }
});

export const {
    convNotFound,
    setConv,
    resetConvState,
    addNewMessage,
    loadNewMessages,
    changeUserStatus,
} = privateConvSlice.actions;