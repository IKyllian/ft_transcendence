import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AuthState } from '../Types/User-Types';
import { LoginPayload } from '../Types/User-Types';

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
            state.currentUser = payload.user;
            state.token = payload.token;
            state.isAuthenticated = true;
            state.loading = false;
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
    }
});

export const { loginPending, loginSuccess, loginError, setUsername, logoutPending, logoutSuccess } = authSlice.actions;