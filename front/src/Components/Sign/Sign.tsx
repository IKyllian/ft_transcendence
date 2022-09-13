import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from "react-hook-form";
import { useEffect } from 'react';
import axios from 'axios';

// import { uid } from "../../env";

type FormValues = {
    username: string,
    password: string,
}

function Sign() {
    const { register, control, handleSubmit } = useForm<FormValues>();
    let navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const onSubmit = handleSubmit(async (data, e) => {
        e?.preventDefault();
        navigate("/home");
        console.log(data);
    });

    useEffect(() => {
        const authorizationCode = searchParams.get('code');

        if (authorizationCode) {
            axios.post('http://localhost:5000/api/auth/login42', { authorizationCode })
            .then((response) => {
                console.log('JWT =>', response.data);
                // TODO stocker le jwt dans le store redux
                navigate('/home');
            })
            .catch(err => {
                // TODO Handle error: Display error message on login page
            });
        }
    }, []);

    const sign42 = async (e: any) => {
        e.preventDefault();
        const url: string = "https://api.intra.42.fr/oauth/authorize";
        const params: string = `?client_id=adbab679751cec3f90c7612f3cbe2a70eb1549967e1abea7873835e05bce7939&redirect_uri=http://localhost:3000&response_type=code`;
        const ret = window.location.replace(url+params);
        // await fetch(url+params, {    
        //     method: 'GET',
        //     mode: 'no-cors',
        //     // headers: {
        //     //     'Access-Control-Allow-Origin':'*',
        //     //     "Content-Type": "application/json",
        //     // }
        // })
        // .then((response) => {
        //     console.log(response);
        //     console.log(response.url);
        //     // response.json()
        // }).catch(err => {
        //     console.log(err);
        // })
        // .then((datas) => {
        //     console.log(datas);
        // })
    }
    
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
                    <input type='submit' value="Login" />
                </form>
            </div>
        </div>
    );
}

export default Sign;