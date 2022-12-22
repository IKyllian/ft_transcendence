import axios from "axios";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";

function ResetPassword() {
    const {register, handleSubmit, setError, formState: {errors}, reset} = useForm<{password: string, passwordConfirm: string, error: string}>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const authorizationCode = searchParams.get('code');

    useEffect(() => {
        if (!authorizationCode)
            navigate("/sign");
    }, [])

    const formSubmit = handleSubmit((data, e) => {
        e?.preventDefault();
        if (data.password !== data.passwordConfirm) {
            setError("error", {message: "Passwords should be same"});
            return ;
        }
        else {
            // setError("error", {message: undefined});
            if (authorizationCode) {
                axios.post(`${process.env.REACT_APP_BASE_URL}/auth/reset-password`, {code: authorizationCode, newPassword: data.password})
                .then(response => {
                    console.log(response);
                    navigate("/sign");
                })
                .catch(err => {
                    console.log(err);
                })
            }
        }
    })
    
    return (
        <div className="sign-container">
            <div className='auth-wrapper'>
                <h2> Reset Password </h2>
                <form className='form-wrapper' onSubmit={formSubmit}>
                    {errors.error && <p className='txt-form-error'> {errors.error.message} </p>}
                    <label> New Password </label>
                    {errors.password && <p className='txt-form-error'> {errors.password.message} </p>}
                    <input
                        id="password"
                        type="password"
                        maxLength={256}
                        {...register("password", {
                            required: "Password is required",
                            minLength: {
                                value: 5,
                                message: "Min length is 5"
                            }
                        })}
                    />
                    <label> Confirm Password </label>
                    {errors.passwordConfirm && <p className='txt-form-error'> {errors.passwordConfirm.message} </p>}
                    <input
                        id="password-confirm"
                        type="password"
                        maxLength={256}
                        {...register("passwordConfirm", {
                            required: "Password is required",
                            minLength: {
                                value: 5,
                                message: "Min length is 5"
                            }
                        })}
                    />
                    <button type='submit'> Change password </button>
                </form>
            </div>
        </div>
    );
}

export default ResetPassword;