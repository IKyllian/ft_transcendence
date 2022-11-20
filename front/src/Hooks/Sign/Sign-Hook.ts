import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from '../../Redux/Hooks'
import { uid } from "../../env";
import { fetchSignIn, fetchSignUp, fetchLogin42 } from '../../Api/Sign/Sign-Fetch';

import { loginPending } from "../../Redux/AuthSlice";

type FormValues = {
    username: string,
    password: string,
    email?: string,
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

    const onSignIn = handleSubmit((data, e) => {
        e?.preventDefault();
        dispatch(loginPending());
        fetchSignIn({username: data.username, password: data.password, dispatch: dispatch});
    });

    const onSignUp = handleSubmit((data, e) => {
        e?.preventDefault();
        dispatch(loginPending());
        fetchSignUp({username: data.username, password: data.password, dispatch: dispatch});
    });

    useEffect(() => {
        const authorizationCode = searchParams.get('code');
        if (authorizationCode) {
            if (authDatas.setUsersame || authDatas.error || !authDatas.loading)
                navigate("/sign");
            dispatch(loginPending());
            fetchLogin42(authorizationCode, dispatch, navigate);
        }
    }, []);

    const sign42 = (e: any) => {
        e.preventDefault();
        const url: string = "https://api.intra.42.fr/oauth/authorize";
        const params: string = `?client_id=${uid}&redirect_uri=http://localhost:3000/sign&response_type=code`;
        const ret = window.location.replace(url+params);
        // const ret = window.open(url+params, "", "popup");
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