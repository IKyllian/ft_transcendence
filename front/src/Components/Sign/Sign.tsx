import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from '../../Redux/Hooks'
import { uid } from "../../env";
import { LoginPayload } from "../../Types/User-Types";

import LoadingSpin from '../Loading-Spin';
import axios from 'axios';

import { loginError, loginPending, loginSuccess, setUsername } from "../../Redux/AuthSlice";

type FormValues = {
    username: string,
    password: string,
}

function Sign() {
    const [isSignIn, setIsSignIn] = useState<boolean>(true);
    const { register, control, handleSubmit } = useForm<FormValues>();
    let navigate = useNavigate();
    const dispatch = useAppDispatch();
    let authDatas = useAppSelector((state) => state.auth);
    const [searchParams] = useSearchParams();


    const onSignIn = handleSubmit(async (data, e) => {
        e?.preventDefault();
        console.log(control);
        if (data.password === "" || data.username === "") {
            dispatch(loginError("username and password must not be empty"));
            return ;
        }
        dispatch(loginPending());
        axios.post('http://localhost:5000/api/auth/login', {username: data.username, password: data.password})
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
    });

    const onSignUp = handleSubmit(async (data, e) => {
        e?.preventDefault();
        if (data.password === "" || data.username === "") {
            dispatch(loginError("username and password must not be empty"));
            return ;
        }
        dispatch(loginPending());
        axios.post('http://localhost:5000/api/auth/signup', {username: data.username, password: data.password})
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
    });

    useEffect(() => {
        const authorizationCode = searchParams.get('code');
        if (authorizationCode) {
            if (authDatas.setUsersame)
                navigate(-1);
            dispatch(loginPending());
            axios.post('http://localhost:5000/api/auth/login42', { authorizationCode })
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
                // TODO Handle error: Display error message on login page
            });
        }
    }, []);

    const sign42 = async (e: any) => {
        e.preventDefault();
        const url: string = "https://api.intra.42.fr/oauth/authorize";
        const params: string = `?client_id=${uid}&redirect_uri=http://localhost:3000/sign&response_type=code`;
        const ret = window.location.replace(url+params);
    }

    return (authDatas.loading) ? (
        <div className="sign-container">
            <LoadingSpin />
        </div>
    ) : (
        <div className="sign-container">
            <div className='auth-wrapper'>
                <h2> {isSignIn ? "Sign In" : "Sign Up"} </h2>
                <button className='sign-42-button' onClick={(e) => sign42(e)}> Sign with 42 </button>
                <div className='auth-separator'>
                    <span>ou</span>
                </div>
                {
                    (authDatas.error !== undefined && authDatas.error !== '') &&
                    <p className='form-error'> {authDatas.error} </p>
                }
                <form className='form-wrapper' onSubmit={isSignIn ? onSignIn : onSignUp}>
                    <label htmlFor="username"> Username </label>
                    <input id="username" type="text" {...register("username")} />

                    <label htmlFor="password"> Password </label>
                    <input id="password" type="password" {...register("password")} />
                    <button type='submit'>
                        {isSignIn ? "Login" : "Create Account"}
                    </button>
                </form>
                <p className='btn-switch-form' onClick={() => setIsSignIn(!isSignIn) }> {isSignIn ? "Pas de compte ? Créez en un" : "Déjà un compte ? Connectez vous"} </p>
            </div>
        </div>
    );
}

export default Sign;