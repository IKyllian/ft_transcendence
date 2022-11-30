import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export enum AlertType {
    ERROR,
    SUCCESS,
    WARNING,
}

export interface AlertState {
    id: number,
    message: string,
    type: AlertType,
}

const defaultState: {alerts: AlertState[]}  = {
    alerts: [],
}

const selectAlertId = (alerts: AlertState[], newId: number): number => {
    if (alerts.find(elem => elem.id === newId))
        return selectAlertId(alerts, newId + 1);
    return newId;
}

export const alertSlice = createSlice({
    name: 'alerts',
    initialState: defaultState,
    reducers: {
        addAlert: (state, {payload}: PayloadAction<{message: string, type: AlertType}>) => {
            const alertId: number = selectAlertId(state.alerts, state.alerts.length);
            state.alerts = [...state.alerts, {...payload, id: alertId}];
        },
        removeAlert: (state, { payload }: PayloadAction<number>) => {
            state.alerts = [...state.alerts.filter(elem => elem.id !== payload)];
        },
    }
});

export const { addAlert, removeAlert } = alertSlice.actions;