import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AuthState } from '../Types/User-Types';
import { LoginPayload } from '../Types/User-Types';
import { UserInterface } from '../Types/User-Types';

const defaultState: AuthState = {
    currentUser: undefined,
    isAuthenticated: false,
    error: undefined,
    loading: false,
    token:'',
    setUsersame: false,
}

export const authSlice = createSlice({
    name: 'auth',
    initialState: defaultState,
    reducers: {
        loginPending: (state) => {
            state.loading = true;
        },
        loginSuccess: (state, {payload}: PayloadAction<LoginPayload>) => {
			console.log("payload", payload);
            state.currentUser = payload.user;
            state.token = payload.token;
            state.isAuthenticated = true;
            state.loading = false;
            console.log("state", state);
        },
        loginError: (state, {payload}: PayloadAction<string>) => {
            state.error = payload;
            state.isAuthenticated = false;
            state.loading = false;
        },
        setUsername: (state) => {
            state.setUsersame = true,
            state.loading = false;
        },
        logoutPending: (state) => {
            state.loading = true;
        },
        logoutSuccess: (state) => {
            state = {
                currentUser: undefined,
                isAuthenticated: false,
                error: undefined,
                loading: false,
                token:'',
                setUsersame: false,
            }
        },
        replaceUserObject: (state, {payload}: PayloadAction<UserInterface>) => {
            state.currentUser = {...payload};
        }
    }
});

export const { loginPending, loginSuccess, loginError, setUsername, logoutPending, logoutSuccess, replaceUserObject } = authSlice.actions;