import { useForm } from "react-hook-form";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch } from '../../Redux/Hooks'
import { useEffect } from "react";
import { logoutSuccess } from "../../Redux/AuthSlice";

interface CustomState {
    token: string,
}

function UsernameForm() {
    const { register, control, handleSubmit } = useForm<{username: string}>();
    
    const location = useLocation();
    let navigate = useNavigate();
    const dispatch = useAppDispatch();

    const locationState = location.state as CustomState;

    console.log(locationState);


    console.log(location);
    const onSubmit = handleSubmit(async (data, e) => {
        e?.preventDefault();
        console.log(data);
        if (data.username === "")
            return ;
        axios.post('http://localhost:5000/api/users/edit-username', {username: data.username}, {
            headers: {
                "authorization": `Bearer ${locationState.token}`,
            }
        })
        .then((response) => {
            console.log(response);
        })
        .catch(err => {
            console.log(err);
            // TODO Handle error: Display error message on login page
        });
    });
    
    useEffect(() => {
        if (!location.state) {
            dispatch(logoutSuccess());
            navigate("/sign");
        }
    }, [location])

    return (
        <div className="sign-container">
            <form className="username-form" onSubmit={onSubmit}>
                <label htmlFor="username"> Username </label>
                <input id="username" type="text" placeholder="Choose Username..." {...register("username")} />
            </form>
        </div>
    );
}

export default UsernameForm;