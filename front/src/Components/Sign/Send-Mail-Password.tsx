import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";

function SendMailPassword() {
    const [mailSend, setMailSend] = useState<boolean>(false);
    const {register, handleSubmit, setError, formState: {errors}, reset} = useForm<{email: string}>();

    const formSubmit = handleSubmit((data, e) => {
        e?.preventDefault();
        axios.post(`${process.env.REACT_APP_BASE_URL}/auth/forgot-password`, {email: data.email})
        .then(response => {
            reset();
            setMailSend(true);
        })
        .catch(err => {
            console.log(err);
            if (mailSend)
                setMailSend(false);
            if (err && err.response && err.response.data && err.response.data.message)
                setError("email", {message: err.response.data.message});
            else
                setError("email", {message: "Email not found"});
        })
    });
    
    return (
        <div className="sign-container">
            <div className='auth-wrapper'>
                <h2> Reset Password </h2>
                <form className='form-wrapper' onSubmit={formSubmit}>
                    <label> Email </label>
                    {errors.email && <p className='txt-form-error'> {errors.email.message} </p>}
                    {mailSend && <p className='txt-form-error' style={{color: 'green'}}> Email has been sent </p>}
                    <input
                        id="email"
                        type="text"
                        {...register("email", {
                            required: "email is required",
                            pattern: {
                                value: new RegExp(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i),
                                message: "invalid email address"
                            }
                        })}
                    />
                    <button type='submit'> Send reset link </button>
                </form>
            </div>
        </div>
    );
}

export default SendMailPassword;