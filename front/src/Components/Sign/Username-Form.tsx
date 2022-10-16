import { useUsernameFormHook } from "../../Hooks/Sign/Username-Form-Hook";

function UsernameForm() {
    const {
        register,
        onSubmit,
    } = useUsernameFormHook();

    return (
        <div className="sign-container">
            <form className="username-form" onSubmit={onSubmit}>
                <label htmlFor="username"> Choose a username </label>
                <input id="username" type="text" placeholder="Username..." {...register("username", {
                    required: true,
                    minLength: {
                        value: 2,
                        message: "Min length is 2"
                    }
                })} />
            </form>
        </div>
    );
}

export default UsernameForm;