import { useNavigate } from 'react-router-dom'
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from '../../Redux/Hooks'
import { uid } from "../../env";
import { usersArray } from '../../Interfaces/Datas-Examples';

import LoadingSpin from '../Loading-Spin';

import { loginPending, loginSuccess, loginError, logoutPending, logoutSuccess } from "../../Redux/AuthSlice";
import { useEffect } from 'react';

type FormValues = {
    username: string,
    password: string,
}

function Sign() {
    const { register, control, handleSubmit } = useForm<FormValues>();
    let navigate = useNavigate();
    const dispatch = useAppDispatch();
    let authDatas = useAppSelector((state) => state.auth);


    const onSubmit = handleSubmit(async (data, e) => {
        e?.preventDefault();
        console.log(data);
        // if (data.password === "" || data.username === "")
        //     return ;
        dispatch(loginPending());
        setTimeout(() => {
            dispatch(loginSuccess(usersArray[0]));
        }, 2000);
        
        // navigate("/home");
    });

    const sign42 = async (e: any) => {
        e.preventDefault();
        const url: string = "https://api.intra.42.fr/oauth/authorize";
        const params: string = `?client_id=${uid}&redirect_uri=http://localhost:3000/home&response_type=code`;
        window.location.replace(url+params);
    }

    useEffect(() => {
        if (authDatas.currentUser !== undefined) {
            navigate("/home");
        }
    }, [authDatas])
    
    return (
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
                        {!authDatas.loading && "Login" }
                        {authDatas.loading && <LoadingSpin />}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Sign;