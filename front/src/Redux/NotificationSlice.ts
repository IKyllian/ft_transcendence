import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { NotificationInterface } from '../Types/Notification-Types';

export interface NotificationState {
    notifications?: NotificationInterface[],
    loading: boolean,
}

const defaultState: NotificationState  = {
    notifications: undefined,
    loading: false,
}

export const notificationSlice = createSlice({
    name: 'notification',
    initialState: defaultState,
    reducers: {
        copyChannelsArray: (state, {payload}: PayloadAction<NotificationInterface[]>) => {
            state.notifications = [...payload];
        },
        addNotification: (state, {payload}: PayloadAction<NotificationInterface>) => {
            if (state.notifications)
                state.notifications = [...state.notifications, payload];
            else
                state.notifications = [payload];
        },
        deleteNotification: (state, {payload}: PayloadAction<number>) => {
            if (state.notifications)
                state.notifications = state.notifications.filter(elem => elem.id === payload);
        },
    }
});

export const { copyChannelsArray, addNotification, deleteNotification } = notificationSlice.actions;