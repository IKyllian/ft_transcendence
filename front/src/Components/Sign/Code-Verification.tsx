import { useForm } from "react-hook-form";

function CodeVerification() {
    const {register} = useForm<{str: string}>();
    return (
        <div className="sign-container">
            <div className="auth-wrapper">
                <form className="validation-form-wrapper">
                    <div>
                        <h2 className="title-verification"> Verification Code </h2>
                        <p className="txt-verification"> Un code de verification vous à été envoyé par mail</p>
                    </div>
                    <input className="code-input" type="text" {...register} />
                    <button> Valider </button>
                </form>
                
            </div>
        </div>
    );
}

export default CodeVerification;