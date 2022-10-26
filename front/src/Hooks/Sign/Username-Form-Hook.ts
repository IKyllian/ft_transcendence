import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from '../../Redux/Hooks'
import { useEffect } from "react";
import { logoutSuccess } from "../../Redux/AuthSlice";
import { fetchSetUsername } from "../../Api/Sign/Sign-Fetch";

interface CustomState {
    token: string,
}

export function useUsernameFormHook() {
    const { register, handleSubmit } = useForm<{username: string}>();
    
    const location = useLocation();
    let navigate = useNavigate();
    const dispatch = useAppDispatch();
    let authDatas = useAppSelector((state) => state.auth);

    const locationState = location.state as CustomState;

	console.log("locationState", locationState);

    const onSubmit = handleSubmit(async (data, e) => {
        e?.preventDefault();
        fetchSetUsername(data.username, locationState.token, dispatch);
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
    }
}