import { useForm } from "react-hook-form";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from '../../Redux/Hooks'
import { useEffect } from "react";
import { logoutSuccess, loginSuccess } from "../../Redux/AuthSlice";
import { LoginPayload } from "../../Types/User-Types";

import { baseUrl } from "../../env";

interface CustomState {
    token: string,
}

function UsernameForm() {
    const { register, control, handleSubmit } = useForm<{username: string}>();
    
    const location = useLocation();
    let navigate = useNavigate();
    const dispatch = useAppDispatch();
    let authDatas = useAppSelector((state) => state.auth);

    const locationState = location.state as CustomState;

    const onSubmit = handleSubmit(async (data, e) => {
        e?.preventDefault();
        if (data.username === "")
            return ;
        axios.patch(`${baseUrl}/users/edit-username`, {username: data.username}, {
            headers: {
                "Authorization": `Bearer ${locationState.token}`,
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
    });
    
    useEffect(() => {
        if (!authDatas.setUsersame) {
            dispatch(logoutSuccess());
            navigate("/sign");
        }
    }, [location])

    return (
        <div className="sign-container">
            <form className="username-form" onSubmit={onSubmit}>
                <label htmlFor="username"> Choose a username </label>
                <input id="username" type="text" placeholder="Username..." {...register("username", {required: true})} />
            </form>
        </div>
    );
}

export default UsernameForm;