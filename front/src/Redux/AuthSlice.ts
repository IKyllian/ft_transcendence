import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AuthState, UserStatus } from '../Types/User-Types';
import { UserInterface } from '../Types/User-Types';

const defaultState: AuthState = {
    currentUser: undefined,
    friendList: [],
    isAuthenticated: false,
    isSign: false,
    error: undefined,
    loading: false,
    loadingIsConnected: true,
    setUsersame: false,
    loggedUserAvatar: undefined,
    displayQRCode: false,
    verification2FA: false,
}

const defaultLogout: AuthState = {...defaultState, loadingIsConnected: false};

export const authSlice = createSlice({
    name: 'auth',
    initialState: defaultState,
    reducers: {
        loginPending: (state) => {
            state.loading = true;
        },
        userFullAuthenticated: (state) => {
            state.isAuthenticated = true;
        },
        changeInGameStatus: (state, {payload}: PayloadAction<string | null>) => {
            if (state.currentUser)
                state.currentUser.in_game_id = payload;
        },
        loginSuccess: (state, {payload}: PayloadAction<UserInterface>) => {
			console.log("payload", payload);
            state.currentUser = payload;
            state.isSign = true;
            state.loading = false;
            state.loadingIsConnected = false,
            console.log("state", state);
        },
        loginError: (state, {payload}: PayloadAction<string>) => {
            state.error = payload;
            state.isAuthenticated = false;
            state.loading = false;
            state.loadingIsConnected = false;
        },
        setUsername: (state) => {
            state.setUsersame = true;
            state.loading = false;
            state.loadingIsConnected = false;
        },
        verification2fa: (state) => {
            state.verification2FA = true;
            state.loading = false;
        },
        leave2fa: (state) => {
            state.verification2FA = false;
        },
        stopIsConnectedLoading: (state) => {
            state.loadingIsConnected = false;
        },
        logoutPending: (state) => {
            state.loading = true;
        },
        logoutSuccess: () => defaultLogout,
        replaceUserObject: (state, {payload}: PayloadAction<UserInterface>) => {
            state.currentUser = {...payload};
        },
        addAvatar: (state, {payload}: PayloadAction<string>) => {
            if (state.currentUser)
                state.currentUser = {...state.currentUser, avatar: payload};
        },
        copyFriendListArray: (state, {payload}: PayloadAction<UserInterface[]>) => {
            state.friendList = [...payload];
        },
        changeFriendListUserStatus: (state, {payload}: PayloadAction<{id: number, status: UserStatus}>) => {
            if (state.friendList.length > 0) {
                state.friendList = [...state.friendList.map(elem => {
                    if (elem.id === payload.id)
                        return {...elem, status: payload.status};
                    return elem;
                })]
            }
        },
        changeFriendListInGameStatus: (state, {payload}: PayloadAction<{id: number, in_game_id: string | null}>) => {
            if (state.friendList.length > 0) {
                state.friendList = [...state.friendList.map((elem: UserInterface) => {
                    if (elem.id === payload.id)
                        return {...elem, in_game_id: payload.in_game_id};
                    return elem;
                })]
            }
        },
        setUserAvatar: (state, {payload}: PayloadAction<string>) => {
            state.loggedUserAvatar = payload;
        },
        change2faStatus: (state, {payload}: PayloadAction<boolean>) => {
            if (state.currentUser)
                state.currentUser = {...state.currentUser, two_factor_enabled: payload};
        },
        changeQRCodeStatus: (state, {payload}: PayloadAction<boolean>) => {
            state.displayQRCode = payload;
        }
    }
});

export const {
    loginPending,
    userFullAuthenticated,
    loginSuccess,
    changeInGameStatus,
    changeFriendListInGameStatus,
    loginError,
    setUsername,
    verification2fa,
    leave2fa,
    stopIsConnectedLoading,
    logoutPending,
    logoutSuccess,
    replaceUserObject,
    addAvatar,
    copyFriendListArray,
    changeFriendListUserStatus,
    setUserAvatar,
    change2faStatus,
    changeQRCodeStatus,
} = authSlice.actions;