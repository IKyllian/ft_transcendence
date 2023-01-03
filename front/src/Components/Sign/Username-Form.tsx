import { useUsernameFormHook } from "../../Hooks/Sign/Username-Form-Hook";

function UsernameForm() {
    const {
        register,
        onSubmit,
        errors,
    } = useUsernameFormHook();

    return (
        <div className="sign-container">
            <form className="username-form" onSubmit={onSubmit}>
                <label htmlFor="username"> Choose a username </label>
                { errors.username && errors.username.message && <p className="txt-form-error"> {errors.username.message} </p> }
                <input
                    autoComplete="off"
                    id="username"
                    type="text"
                    placeholder="Username..."
                    maxLength={15}
                    {...register("username", {
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
            </form>
        </div>
    );
}

export default UsernameForm;