import { Dispatch, AnyAction } from "@reduxjs/toolkit";
import axios from "axios";
import { loginSuccess, loginError, stopIsConnectedLoading } from "../../Redux/AuthSlice";
import { TokenStorageInterface } from "../../Types/Utils-Types";
import api from "../Api";

interface SignParameter {
    readonly username: string,
    readonly email?: string,
    readonly password: string,
    dispatch:  Dispatch<AnyAction>,
}

export async function fetchSignIn(username: string, password: string) {
    return await axios.post(`${process.env.REACT_APP_BASE_URL}/auth/login`, {username: username, password: password});
}

export function fetchSignUp({username, email, password, dispatch}: SignParameter) {
    axios.post(`${process.env.REACT_APP_BASE_URL}/auth/signup`, {username: username, email: email, password: password})
    .then((response) => {
        const tokenStorage: TokenStorageInterface = {
            access_token: response.data.access_token,
            refresh_token: response.data.refresh_token,
        }
        localStorage.setItem("userToken", JSON.stringify(tokenStorage));
        dispatch(loginSuccess({...response.data.user, blocked: [], channelUser: []}));
    }).catch(err => {
        console.log("Error", err);
        if (err && err.response && err.response.data && err.response.data.message)
            dispatch(loginError(err.response.data.message));
        else
            dispatch(loginError("Error while signup"));
    })
}

export async function fetchLogin42(authorizationCode: string) {
    return await axios.post(`${process.env.REACT_APP_BASE_URL}/auth/login42`, { authorizationCode });
}

export async function fetchSetUsername(username: string, token: string,) {
    return await axios.patch(`${process.env.REACT_APP_BASE_URL}/users/edit-username`, {username: username}, {
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    });
}

export function fetchVerifyToken(dispatch: Dispatch<AnyAction>) {
    api.post(`/auth/verify-token`, {})
    .then((response) => {
        dispatch(loginSuccess(response.data));
    })
    .catch((err) => {
        console.log(err);
        dispatch(stopIsConnectedLoading());
    })
}