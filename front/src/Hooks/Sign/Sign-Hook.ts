import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from '../../Redux/Hooks'
import { uid } from "../../env";
import { fetchSignIn, fetchSignUp, fetchLogin42, fetchVerifyToken } from '../../Api/Sign/Sign-Fetch';

import { loginError, loginPending, loginSuccess, setUsername, stopIsConnectedLoading, verification2fa } from "../../Redux/AuthSlice";
import { TokenStorageInterface } from '../../Types/Utils-Types';

type FormValues = {
    username: string,
    password: string,
    email: string,
}

export function useSignHook() {
    const [isSignIn, setIsSignIn] = useState<boolean>(true);
    const { register, handleSubmit, reset, formState: {errors} } = useForm<FormValues>();

    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [searchParams] = useSearchParams();
    let authDatas = useAppSelector((state) => state.auth);

    const changeForm = () => {
        setIsSignIn(!isSignIn);
        reset();
    }

    const verifyToken = () => {
		if (localStorage.getItem("userToken") !== null) {
			fetchVerifyToken(dispatch);
		} else {
			dispatch(stopIsConnectedLoading());
		}
	}
    
    const onSignIn = handleSubmit((data, e) => {
        e?.preventDefault();
        dispatch(loginPending());
        fetchSignIn(data.username, data.password).then(response => {
            console.log('JWT =>', response.data);
            if (response.data.access_2fa_token) {
                dispatch(verification2fa());
                navigate("/2fa-verification", {state: {access_2fa_token: response.data.access_2fa_token}});
            } else {
                const tokenStorage: TokenStorageInterface = {
                    access_token: response.data.access_token,
                    refresh_token: response.data.refresh_token,
                }
                localStorage.setItem("userToken", JSON.stringify(tokenStorage));
                dispatch(loginSuccess(response.data.user));
            }
        })
        .catch(err => {
            dispatch(loginError("username or password incorect"));
        })
    });

    const onSignUp = handleSubmit((data, e) => {
        e?.preventDefault();
        dispatch(loginPending());
        fetchSignUp({username: data.username, email: data.email, password: data.password, dispatch: dispatch});
    });

    useEffect(() => {
        window.addEventListener('storage', () => verifyToken());
        const authorizationCode = searchParams.get('code');
        if (authorizationCode) {
            if (authDatas.setUsersame || authDatas.error || !authDatas.loading)
                navigate("/sign");
            dispatch(loginPending());
            fetchLogin42(authorizationCode).then(response => {
                console.log("Response Sign in 42", response);
                if (response.data.access_2fa_token) {
                    dispatch(verification2fa());
                    navigate("/2fa-verification", {state: {access_2fa_token: response.data.access_2fa_token}});
                } else {
                    if (response.data.usernameSet) {
                        const tokenStorage: TokenStorageInterface = {
                            access_token: response.data.access_token,
                            refresh_token: response.data.refresh_token,
                        }
                        localStorage.setItem("userToken", JSON.stringify(tokenStorage));
                        dispatch(loginSuccess(response.data.user));
                    } else {
                        dispatch(setUsername());
                        navigate("/set-username", {state:{access_token: response.data.access_token, refresh_token: response.data.refresh_token}});
                    }
                }
            })
            .catch(err => {
                console.log(err);
                dispatch(loginError("Error while login with 42"));
            });
        }

        return () => {
            window.removeEventListener('storage', () => {});
        }
    }, []);

    const sign42 = (e: any) => {
        e.preventDefault();
        const url: string = "https://api.intra.42.fr/oauth/authorize";
		// TODO redirect ip
        const params: string = `?client_id=${uid}&redirect_uri=http://10.1.8.1:3000/sign&response_type=code`;
        const ret = window.location.replace(url+params);
    }

    return {
        hookForm: {
            register: register,
            errors: errors,
        },
        authDatas,
        isSignIn,
        changeForm,
        onSignIn,
        onSignUp,
        sign42,
    }
}