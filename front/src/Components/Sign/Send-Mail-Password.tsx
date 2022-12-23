import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { addAlert, AlertType } from "../../Redux/AlertSlice";
import { useAppDispatch } from "../../Redux/Hooks";

function SendMailPassword() {
    const [mailSend, setMailSend] = useState<boolean>(false);
    const {register, handleSubmit, setError, formState: {errors}, reset} = useForm<{email: string}>();
    const dispatch = useAppDispatch();

    const formSubmit = handleSubmit((data, e) => {
        e?.preventDefault();
        axios.post(`${process.env.REACT_APP_BASE_URL}/auth/forgot-password`, {email: data.email})
        .then(response => {
            dispatch(addAlert({message: "Email has been sent", type: AlertType.SUCCESS}));
            reset();
            setMailSend(true);
        })
        .catch(err => {
            console.log(err);
            if (mailSend)
                setMailSend(false);
            setError("email", {message: err.response.data.message});
        })
    });
    
    return (
        <div className="sign-container">
            <div className='auth-wrapper'>
                <h2> Reset Password </h2>
                <form className='form-wrapper' onSubmit={formSubmit}>
                    <label> Email </label>
                    {errors.email && <p className='txt-form-error'> {errors.email.message} </p>}
                    {mailSend && <p className='txt-form-error' style={{color: 'green'}}> Email has been send </p>}
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