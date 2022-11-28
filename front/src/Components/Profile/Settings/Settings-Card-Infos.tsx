import { IconLock } from "@tabler/icons";
import axios from "axios";
import { useForm } from "react-hook-form";
import { baseUrl } from "../../../env";
import { replaceUserObject } from "../../../Redux/AuthSlice";
import { useAppDispatch, useAppSelector } from "../../../Redux/Hooks";
import { UserInterface } from "../../../Types/User-Types";

interface FormState {
    usernameForm: {
        username: string
    },
    passwordForm: {
        oldPassword: string,
        newPassword: string,
    }
}

function SettingsCardInfos(props: {currentUser: UserInterface}) {
    const { currentUser } = props;
    const { token } = useAppSelector(state => state.auth);
    const {register, watch, handleSubmit, formState: {errors}, setError} = useForm<FormState>({defaultValues: {usernameForm: {username: currentUser?.username}}});
    const dispatch = useAppDispatch();
    const watchUsersame = watch("usernameForm.username");

    const usernameSubmit = handleSubmit((data, e) => {
        e?.preventDefault();
        axios.patch(`${baseUrl}/users/edit-username`, {username: data.usernameForm.username}, {
            headers: {
                "Authorization": `Bearer ${token}`,
            }
        })
        .then(response => {
            console.log("response Edit username", response.data);
            dispatch(replaceUserObject(response.data));
        })
        .catch(err => {
            console.log(err);
            setError("usernameForm.username", {message: "Username already exist"});
        })
    })

    const passwordSubmit = handleSubmit((data, e) => {
        e?.preventDefault();
        axios.patch(`${baseUrl}/users/edit-password`, {old: data.passwordForm.oldPassword, new: data.passwordForm.newPassword}, {
            headers: {
                "Authorization": `Bearer ${token}`,
            }
        })
        .then(response => {
            console.log("Response Edit PAssword", response);
        })
        .catch(err => {
            console.log("ERR", err);
        })
    })

    return (
        <div className="user-infos-card">
            <h3> Edit Profile </h3>
            <form onSubmit={usernameSubmit}>
                <div>
                    <label>
                        Username
                        { errors && errors.usernameForm && errors.usernameForm.username && <p className='txt-form-error'> {errors.usernameForm.username.message} </p> }
                        <div className="label-input-wrapper">
                            <input
                                type="text"
                                {...register("usernameForm.username", {
                                    minLength: {
                                        value: 2,
                                        message: "Min length is 2"
                                    },
                                    required: "Username is required"
                                    
                                })}
                            />
                            { watchUsersame !== currentUser.username && <button className="username-save" type="submit"> Save </button> }
                        </div>
                    </label>
                </div>
                <label >
                    Email
                    <div className="label-input-wrapper">
                        <input disabled className="lock-input" type="text" value={currentUser.email} />
                        <IconLock />
                    </div>
                </label>
            </form>
            <form onSubmit={passwordSubmit}>
                <label>
                    Old Password
                    { errors && errors.passwordForm && errors.passwordForm.oldPassword && <p className='txt-form-error'> {errors.passwordForm.oldPassword.message} </p> }
                    <input
                        type="password"
                        {...register("passwordForm.oldPassword", {
                            // required: "Old password is required",
                            // minLength: {
                            //     value: 5,
                            //     message: "Min length is 5",
                            // }
                        })}
                    />
                </label>
                <label>
                    New Password
                    { errors && errors.passwordForm && errors.passwordForm.newPassword && <p className='txt-form-error'> {errors.passwordForm.newPassword.message} </p> }
                    <input
                        type="password"
                        {...register("passwordForm.newPassword", {
                            // required: "New password is required",
                            // minLength: {
                            //     value: 5,
                            //     message: "Min length is 5",
                            // }
                        })}
                    />
                </label>
                <div>
                    <button type="submit"> Change Password </button>
                </div>
            </form>
            <div>
                <button> Activate Two-Factor Authentication </button>
            </div>
            
        </div>
    );
}

export default SettingsCardInfos;