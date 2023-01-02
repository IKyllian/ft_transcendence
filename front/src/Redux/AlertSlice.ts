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
            if (state.alerts.length === 3)
                state.alerts.pop();
            const alertId: number = selectAlertId(state.alerts, state.alerts.length);
            state.alerts = [{...payload, id: alertId}, ...state.alerts];
        },
        removeAlert: (state, { payload }: PayloadAction<number>) => {
            state.alerts = [...state.alerts.filter(elem => elem.id !== payload)];
        },
        resetAlert: () => defaultState,
    }
});

export const { addAlert, removeAlert, resetAlert } = alertSlice.actions;