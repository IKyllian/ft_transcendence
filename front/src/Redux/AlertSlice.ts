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

    //FOR TEST
    // alerts: [
    //     {
    //         id: 0,
    //         message: "Alert 1",
    //         type: AlertType.SUCCESS,
    //     }, {
    //         id: 1,
    //         message: "Alert 2",
    //         type: AlertType.WARNING,
    //     }, {
    //         id: 2,
    //         message: "Alert 3",
    //         type: AlertType.ERROR,
    //     },
    // ],
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
    }
});

export const { addAlert, removeAlert } = alertSlice.actions;