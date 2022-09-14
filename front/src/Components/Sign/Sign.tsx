import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from '../../Redux/Hooks'
import { uid } from "../../env";
import { usersArray } from '../../Interfaces/Datas-Examples';
import { LoginPayload } from "../../Interfaces/Interface-User";

import LoadingSpin from '../Loading-Spin';
import axios from 'axios';

import { loginPending, loginSuccess } from "../../Redux/AuthSlice";

type FormValues = {
    username: string,
    password: string,
}

function Sign() {
    const { register, control, handleSubmit } = useForm<FormValues>();
    let navigate = useNavigate();
    const dispatch = useAppDispatch();
    let authDatas = useAppSelector((state) => state.auth);
    const [searchParams] = useSearchParams();


    const onSubmit = handleSubmit(async (data, e) => {
        e?.preventDefault();
        console.log(data);
        // if (data.password === "" || data.username === "")
        //     return ;
        // dispatch(loginPending());
        // setTimeout(() => {
        //     dispatch(loginSuccess(usersArray[0]));
        // }, 2000);
        
        // navigate("/home");
    });

    useEffect(() => {
        const authorizationCode = searchParams.get('code');
        
        if (authorizationCode) {
            dispatch(loginPending());
            axios.post('http://localhost:5000/api/auth/login42', { authorizationCode })
            .then((response) => {
                console.log('JWT =>', response.data);
                if (response.data.usernameSet) {
                    const payload: LoginPayload = {
                        token: response.data.token.access_token,
                        user: response.data.user,
                    }
                    dispatch(loginSuccess(payload));
                } else {
                    navigate("/set-username", {state:{token: response.data.token}});
                    // navigate("/set-username");
                }
                // TODO stocker le jwt dans le store redux
            })
            .catch(err => {
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
                <h2> Sign In </h2>
                <button className='sign-42-button' onClick={(e) => sign42(e)}> Sign with 42 </button>
                <div className='auth-separator'>
                    <span>ou</span>
                </div>
                <form className='form-wrapper' onSubmit={onSubmit}>
                    <label htmlFor="username"> Username </label>
                    <input id="username" type="text" {...register("username")} />

                    <label htmlFor="password"> Password </label>
                    <input id="password" type="password" {...register("password")} />
                    <button type='submit'>
                        Login
                        {/* {!authDatas.loading && "Login" } */}
                        {/* {authDatas.loading && <LoadingSpin />} */}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Sign;