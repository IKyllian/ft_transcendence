import { Dispatch, AnyAction } from "@reduxjs/toolkit";
import axios from "axios";
import { baseUrl } from "../../env";
import { loginSuccess, loginError, stopIsConnectedLoading } from "../../Redux/AuthSlice";
import api from "../Api";

interface SignParameter {
    readonly username: string,
    readonly email?: string,
    readonly password: string,
    dispatch:  Dispatch<AnyAction>,
}

export async function fetchSignIn(username: string, password: string) {
    return await axios.post(`${baseUrl}/auth/login`, {username: username, password: password});
}

export function fetchSignUp({username, email, password, dispatch}: SignParameter) {
    axios.post(`${baseUrl}/auth/signup`, {username: username, email: email, password: password})
    .then((response) => {
        console.log('JWT =>', response.data);
        dispatch(loginSuccess({...response.data.user, blocked: [], channelUser: []}));
    }).catch(err => {
        dispatch(loginError("username or password incorect"));
    })
}

export async function fetchLogin42(authorizationCode: string) {
    return await axios.post(`${baseUrl}/auth/login42`, { authorizationCode });
}

export function fetchSetUsername(username: string, token: string, dispatch: Dispatch<AnyAction>) {
    axios.patch(`${baseUrl}/users/edit-username`, {username: username}, {
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    })
    .then((response) => {
		console.log("response,", response);
        dispatch(loginSuccess(response.data));
    })
    .catch(err => {
        console.log(err);
        // TODO Handle error: Display error message on login page
    });
}

export function fetchVerifyToken(dispatch: Dispatch<AnyAction>) {
    api.post(`${baseUrl}/auth/verify-token`, {})
    .then((response) => {
        console.log("Response VerifyToken", response);
        dispatch(loginSuccess(response.data));
    })
    .catch((err) => {
        console.log(err);
        dispatch(stopIsConnectedLoading());
    })

    // axios.post(`${baseUrl}/auth/verify-token`, {}, {
    //     headers: {
    //         "Authorization": `Bearer ${token}`,
    //     }
    // })
    // .then((response) => {
    //     console.log("Response VerifyToken", response);
    //     dispatch(loginSuccess({user: response.data, token: token}));
    // })
    // .catch((err) => {
    //     console.log(err);
    //     dispatch(stopIsConnectedLoading());
    // })
}