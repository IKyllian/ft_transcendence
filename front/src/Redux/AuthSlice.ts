import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AuthState } from '../Types/User-Types';
import { LoginPayload } from '../Types/User-Types';
import { Channel } from '../Types/Chat-Types';
// import { ServerToClientEvents, ClientToServerEvents } from '../Types/User-Types';
import { io, Socket } from 'socket.io-client';
import { baseUrl } from '../env';

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
            const newSocket: any = io(`http://10.1.9.4:5000`, {extraHeaders: {
                "Authorization": `Bearer ${state.token}`,
            }});
            state.socket = newSocket;
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
            // state = defaultState;
            state = {
                currentUser: undefined,
                isAuthenticated: false,
                error: undefined,
                loading: false,
                token:'',
                setUsersame: false,
            }
        },

        // updateUserChannels: (state, {payload}: PayloadAction<Channel>) => {
        //     if (!state.currentUser?.channels) 
        //         state.currentUser?.channels = [payload];
        //     else
        //         state.currentUser?.channels = [... payload];

        // }
            
    }
});

export const { loginPending, loginSuccess, loginError, setUsername, logoutPending, logoutSuccess } = authSlice.actions;