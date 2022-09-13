import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AuthState, ExampleUser } from '../Interfaces/Interface-User';

const defaultState: AuthState = {
    currentUser: undefined,
    isAuthenticated: false,
    error: '',
    loading: false,
}

export const authSlice = createSlice({
    name: 'auth',
    initialState: defaultState,
    reducers: {
        loginPending: (state) => {
            state.loading = true;
        },
        loginSuccess: (state, {payload}: PayloadAction<ExampleUser>) => {
            state.currentUser = payload;
            state.isAuthenticated = true;
            state.loading = false;
        },
        loginError: (state, {payload}: PayloadAction<string>) => {
            state.error = payload;
            state.isAuthenticated = false;
            state.loading = false;
        },
        logoutPending: (state) => {
            state.loading = true;
        },
        logoutSuccess: (state) => {
            state.loading = false
            state.isAuthenticated = false;
            state.error = '';
            state.currentUser = undefined;
        }
    }
});

export const { loginPending, loginSuccess, loginError, logoutPending, logoutSuccess } = authSlice.actions;