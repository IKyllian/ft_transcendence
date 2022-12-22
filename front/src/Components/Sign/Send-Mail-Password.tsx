import axios from "axios";
import { useForm } from "react-hook-form";

function SendMailPassword() {
    const {register, handleSubmit, setError, formState: {errors}, reset} = useForm<{email: string}>();

    const formSubmit = handleSubmit((data, e) => {
        e?.preventDefault();
        axios.post(`${process.env.REACT_APP_BASE_URL}/auth/forgot-password`, {email: data.email})
        .then(response => {
            console.log(response);
        })
        .catch(err => {
            console.log(err);
            setError("email", {message: "Email does not exist"});
        })
    });
    
    return (
        <div className="sign-container">
            <div className='auth-wrapper'>
                <h2> Reset Password </h2>
                <form className='form-wrapper' onSubmit={formSubmit}>
                    <label> Email </label>
                    {errors.email && <p className='txt-form-error'> {errors.email.message} </p>}
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