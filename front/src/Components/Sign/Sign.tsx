import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from '../../Redux/Hooks'
import { uid } from "../../env";
import { LoginPayload } from "../../Types/User-Types";

import LoadingSpin from '../Utils/Loading-Spin';
import axios from 'axios';

import { loginError, loginPending, loginSuccess, setUsername } from "../../Redux/AuthSlice";

type FormValues = {
    username: string,
    password: string,
}

function Sign() {
    const [isSignIn, setIsSignIn] = useState<boolean>(true);
    const { register, handleSubmit, reset, formState: {errors}} = useForm<FormValues>();
    let navigate = useNavigate();
    const dispatch = useAppDispatch();
    let authDatas = useAppSelector((state) => state.auth);
    const [searchParams] = useSearchParams();

    const onSignIn = handleSubmit(async (data, e) => {
        e?.preventDefault();
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
                {authDatas.error && <p className='txt-form-error'> {authDatas.error} </p> }
                <form className='form-wrapper' onSubmit={isSignIn ? onSignIn : onSignUp}>
                    <label> Username </label>
                    {errors.username && <p className='txt-form-error'> {errors.username.message} </p>}
                    <input
                        id="username"
                        type="text"
                        {...register("username", {
                            required: "Username is required",
                            minLength: {
                                value: 2,
                                message: "Min length is 2"
                            }
                        })}
                    />

                    <label> Password </label>
                    {errors.password && <p className='txt-form-error'> {errors.password.message} </p>}
                    <input
                        id="password"
                        type="password"
                        {...register("password", {
                            required: "Password is required",
                            minLength: !isSignIn ? { 
                                value: 5,
                                message: "Min length is 5"
                            } : 5
                        })}
                    />
                    <button type='submit'>
                        {isSignIn ? "Login" : "Create Account"}
                    </button>
                </form>
                <p className='btn-switch-form' onClick={() => {setIsSignIn(!isSignIn); reset() }}> {isSignIn ? "Pas de compte ? Créez en un" : "Déjà un compte ? Connectez vous"} </p>
            </div>
        </div>
    );
}

export default Sign;