import axios from "axios";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { leave2fa, loginSuccess } from "../../Redux/AuthSlice";
import { useAppDispatch, useAppSelector } from "../../Redux/Hooks";
import { TokenStorageInterface } from "../../Types/Utils-Types";

function CodeVerification() {
    const {register, handleSubmit, setError, formState: {errors}, watch} = useForm<{code: string}>();
    const { verification2FA } = useAppSelector(state => state.auth);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const location = useLocation();
    const codeWatch = watch("code");
    const locationState = location.state as {access_2fa_token: string};

    useEffect(() => {
        if (!location.state || !verification2FA)
            navigate('/sign');

        return () => {
            dispatch(leave2fa());
        }
    }, []);

    useEffect(() => {
        if (codeWatch && codeWatch.length === 6) {
            axios.post(`${process.env.REACT_APP_BASE_URL}/2fa/authenticate`, {code: codeWatch}, {
                headers: {
                    "Authorization": `Bearer ${locationState.access_2fa_token}`,
                }
            })
            .then(response => {
                const tokenStorage: TokenStorageInterface = {
                    access_token: response.data.access_token,
                    refresh_token: response.data.refresh_token,
                }
                localStorage.setItem("userToken", JSON.stringify(tokenStorage));
                dispatch(loginSuccess(response.data.user));
            })
            .catch(err => {
                console.log("ERR Authenticate", err);
                setError("code", {message: "Code Incorrect"});
            });
        }
    }, [codeWatch])
    
    const codeSubmmit = handleSubmit((data, e) => {
        e?.preventDefault();
    })

    return (
        <div className="sign-container">
            <div className="auth-wrapper">
                <div>
                    <h2 className="title-verification"> Verification Code </h2>
                    <p className="txt-verification"> Veillez rentrer le code afficher sur Google Authenticator </p>
                </div>
                <form className="validation-form-wrapper" onSubmit={codeSubmmit}>
                    { errors.code && <p className='txt-form-error'> {errors.code.message} </p> }
                    <input
                        autoComplete="off"
                        className="code-input"
                        type="text"
                        maxLength={6}
                        {...register("code", {
                            required: "Code is required",
                            minLength: {value: 6, message: "Code should have a length of 6"}
                        })}
                    />
                    <button> Valider </button>
                </form>
            </div>
        </div>
    );
}

export default CodeVerification;