import { Dispatch, AnyAction } from "@reduxjs/toolkit";
import axios from "axios";
import { baseUrl } from "../../env";
import { LoginPayload } from "../../Types/User-Types";
import { loginSuccess, loginError, setUsername } from "../../Redux/AuthSlice";
import { NavigateFunction } from "react-router-dom";

interface SignParameter {
    readonly username: string,
    readonly password: string,
    dispatch:  Dispatch<AnyAction>,
}

export function fetchSignIn({username, password, dispatch}: SignParameter) {
    axios.post(`${baseUrl}/auth/login`, {username: username, password: password})
    .then((response) => {
        console.log('JWT =>', response.data);
        const payload: LoginPayload = {
            token: response.data.token,
            user: response.data.user,
        }
        dispatch(loginSuccess(payload));
    }).catch(err => {
        dispatch(loginError("username or password incorect"));
    })
}

export function fetchSignUp({username, password, dispatch}: SignParameter) {
    axios.post(`${baseUrl}/auth/signup`, {username: username, password: password})
    .then((response) => {
        console.log('JWT =>', response.data);
        const payload: LoginPayload = {
            token: response.data.token,
            user: response.data.user,
        }
        dispatch(loginSuccess(payload));
    }).catch(err => {
        dispatch(loginError("username or password incorect"));
    })
}

export function fetchLogin42(authorizationCode: string, dispatch: Dispatch<AnyAction>, navigate: NavigateFunction) {
    axios.post(`${baseUrl}/auth/login42`, { authorizationCode })
    .then((response) => {
        console.log('JWT =>', response.data);
        if (response.data.usernameSet) {
            const payload: LoginPayload = {
                token: response.data.token,
                user: response.data.user,
            }
            dispatch(loginSuccess(payload));
        } else {
            dispatch(setUsername());
            navigate("/set-username", {state:{token: response.data.token}});
        }
    })
    .catch(err => {
        dispatch(loginError("Error while login with 42"));
    });
}

export function fetchSetUsername(username: string, token: string, dispatch: Dispatch<AnyAction>) {
    axios.patch(`${baseUrl}/users/edit-username`, {username: username}, {
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    })
    .then((response) => {
        const payload: LoginPayload = {
            user: response.data.user,
            token: response.data.token,
        }
        dispatch(loginSuccess(payload));
    })
    .catch(err => {
        console.log(err);
        // TODO Handle error: Display error message on login page
    });
}