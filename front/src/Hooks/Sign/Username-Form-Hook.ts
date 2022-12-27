import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from '../../Redux/Hooks'
import { useEffect } from "react";
import { loginSuccess, logoutSuccess } from "../../Redux/AuthSlice";
import { fetchSetUsername } from "../../Api/Sign/Sign-Fetch";
import { TokenStorageInterface } from "../../Types/Utils-Types";

export function useUsernameFormHook() {
    const { register, handleSubmit, formState: {errors}, setError } = useForm<{username: string}>();
    
    const location = useLocation();
    let navigate = useNavigate();
    const dispatch = useAppDispatch();
    let authDatas = useAppSelector((state) => state.auth);

    const locationState = location.state as TokenStorageInterface;

    const onSubmit = handleSubmit(async (data, e) => {
        e?.preventDefault();
        fetchSetUsername(data.username, locationState.access_token)
        .then(response => {
            localStorage.setItem("userToken", JSON.stringify(locationState));
            dispatch(loginSuccess(response.data));
        })
        .catch(err => {
            console.log(err);
            if (err && err.response && err.response.data && err.response.data.message)
                setError("username", {message: err.response.data.message});
            else
                setError("username", {message: "Username already exist"});
        })
    });
    
    useEffect(() => {
        if (!authDatas.setUsersame) {
            dispatch(logoutSuccess());
            navigate("/sign");
        }
    }, [location])

    return {
        register,
        onSubmit,
        errors,
    }
}