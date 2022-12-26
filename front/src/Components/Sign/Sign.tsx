import LoadingSpin from '../Utils/Loading-Spin';
import { useSignHook } from '../../Hooks/Sign/Sign-Hook';
import { Link } from 'react-router-dom';

function Sign() {
    const {
        hookForm,
        authDatas,
        isSignIn,
        changeForm,
        onSignIn,
        onSignUp,
        sign42,
    } = useSignHook();

    return (authDatas.loading) ? (
        <div className="sign-container">
            <LoadingSpin />
        </div>
    ) : (
        <div className="sign-container">
            <div className='auth-wrapper'>
                <h2> {isSignIn ? "Sign In" : "Sign Up"} </h2>
                <button className='sign-42-button' onClick={(e) => sign42(e)}> Sign with 42 </button>
                <div className='auth-separator'>
                    <span>ou</span>
                </div>
                {authDatas.error && <p className='txt-form-error'> { authDatas.error } </p> }
                <form className='form-wrapper' onSubmit={isSignIn ? onSignIn : onSignUp}>
                    { !isSignIn && <label> Username </label>}
                    { isSignIn && <label> Username or Email </label>}
                    {hookForm.errors.username && <p className='txt-form-error'> { hookForm.errors.username.message } </p>}
                    <input
                        id="username"
                        type="text"
                        maxLength={15}
                        {...hookForm.register("username", {
                            required: "Username is required",
                            minLength: {
                                value: 1,
                                message: "Min length is 1"
                            },
                            pattern: {
                                message: "invalid username",
                                value: new RegExp(/^[a-zA-Z0-9-_.]+$/),
                            }
                        })}
                    />
                    {
                        !isSignIn && 
                        <label> Email </label>
                    }
                    {!isSignIn && hookForm.errors.email && <p className='txt-form-error'> { hookForm.errors.email.message } </p>}
                    {
                        !isSignIn && 
                        <input
                            id="email"
                            type="text"
                            {...hookForm.register("email", {
                                required: "Email is required",
                                pattern: {
                                    value: new RegExp(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i),
                                    message: "invalid email address"
                                }
                            })}
                        />
                    }
                    <label> Password </label>
                    {hookForm.errors.password && <p className='txt-form-error'> { hookForm.errors.password.message } </p>}
                    <input
                        id="password"
                        type="password"
                        maxLength={256}
                        {...hookForm.register("password", {
                            required: "Password is required",
                            minLength: !isSignIn ? { 
                                value: 5,
                                message: "Min length is 5"
                            } : 5
                        })}
                    />
                    {
                        isSignIn && 
                        <Link to="/forgot-password">
                            <p className='forgot-password'> Mot de passe oublié ? </p>
                        </Link>
                    }
                    <button type='submit'>
                        {isSignIn ? "Login" : "Create Account"}
                    </button>
                </form>
                <p className='btn-switch-form' onClick={() => changeForm()}> {isSignIn ? "Pas de compte ? Créez en un" : "Déjà un compte ? Connectez vous"} </p>
            </div>
        </div>
    );
}

export default Sign;