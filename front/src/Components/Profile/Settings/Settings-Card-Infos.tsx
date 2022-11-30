import { IconLock } from "@tabler/icons";
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { baseUrl } from "../../../env";
import { addAlert, AlertType } from "../../../Redux/AlertSlice";
import { change2faStatus, changeQRCodeStatus, replaceUserObject } from "../../../Redux/AuthSlice";
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
    const [displayQRCode, setDisplayQRCode] = useState<{show: boolean, qrcode: string | undefined}>({show: false, qrcode: undefined});
    const [disable2fa, setDisable2fa] = useState<boolean>(false);
    const { token } = useAppSelector(state => state.auth);
    const {register, watch, handleSubmit, formState: {errors}, setError, resetField} = useForm<FormState>({defaultValues: {usernameForm: {username: currentUser?.username}}});
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
            dispatch(addAlert({message: "Username changed", type: AlertType.SUCCESS}));
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
            resetField("passwordForm.oldPassword");
            resetField("passwordForm.newPassword");
            dispatch(addAlert({message: "Password changed", type: AlertType.SUCCESS}));
        })
        .catch(err => {
            console.log("ERR", err);
            setError("passwordForm.oldPassword", {message: "Password incorrect"});
        })
    })

    const enableTwoFactor = () => {
        const req = new Request(`${baseUrl}/2fa/generate`, {method: 'POST', body: undefined ,headers: {"Authorization": `Bearer ${token}`}});
        fetch(req)
        .then(async (response) => {
            console.log("2FA response", response);
            const avatarBlob = await response.blob();
            const qrCodeUrl = URL.createObjectURL(avatarBlob)
            setDisplayQRCode({show: true, qrcode: qrCodeUrl});
        }) 
        .catch(err => {
            console.log("err", err);
        })
    }

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
                            required: "Old password is required",
                            minLength: {
                                value: 5,
                                message: "Min length is 5",
                            }
                        })}
                    />
                </label>
                <label>
                    New Password
                    { errors && errors.passwordForm && errors.passwordForm.newPassword && <p className='txt-form-error'> {errors.passwordForm.newPassword.message} </p> }
                    <input
                        type="password"
                        {...register("passwordForm.newPassword", {
                            required: "New password is required",
                            minLength: {
                                value: 5,
                                message: "Min length is 5",
                            }
                        })}
                    />
                </label>
                <div>
                    <button type="submit"> Change Password </button>
                </div>
            </form>
            <div>
                { !displayQRCode.show && !currentUser.two_factor_enabled && <button onClick={() => enableTwoFactor()}> Activate Two-Factor Authentication </button> }
                { !displayQRCode.show && currentUser.two_factor_enabled && !disable2fa && <button onClick={() => setDisable2fa(true)}> Disable Two-Factor Authentication </button> }
                {
                    displayQRCode.show && displayQRCode.qrcode &&
                    <QRCodeValidation qrcode={displayQRCode.qrcode} token={token} setDisplayQRCode={setDisplayQRCode} />
                }
                { !displayQRCode.show && currentUser.two_factor_enabled && disable2fa && <Disable2fa token={token} /> }
            </div>
        </div>
    );
}

function Disable2fa(props: {token: string}) {
    const { token } = props
    const {register, handleSubmit, formState: {errors}, setError} = useForm<{code: string}>();
    const dispatch = useAppDispatch();

    const codeSubmit = handleSubmit((data, e) => {
        e?.preventDefault();
        axios.post(`${baseUrl}/2fa/disable`, {code: data.code}, {
            headers: {
                "Authorization": `Bearer ${token}`,
            }
        })
        .then((response) => {
            console.log("response 2fa enable", response);
            dispatch(addAlert({message: "Two-Factor Authentication Disabled", type: AlertType.SUCCESS}));
            dispatch(change2faStatus(false));
        })
        .catch(err => {
            console.log(err);
            setError("code", {message: "Code incorrect"});
        })
    })

    return (
        <div className="qrcode-wrapper">
            <form onSubmit={codeSubmit}>
            <label>
                    Enter Your Code
                    { errors && errors.code && <p className='txt-form-error'> {errors.code.message} </p> }
                    <input
                        type="text"
                        {...register("code", {
                            required: "Code is required",
                        })}
                    />
                </label>
                <button> Send </button>
            </form>
        </div>
    );
}

function QRCodeValidation(props: {qrcode: string, token: string, setDisplayQRCode: Function}) {
    const { qrcode, token, setDisplayQRCode } = props
    const {register, handleSubmit, formState: {errors}, setError} = useForm<{code: string}>();
    const dispatch = useAppDispatch();

    const codeSubmit = handleSubmit((data, e) => {
        e?.preventDefault();
        axios.post(`${baseUrl}/2fa/enable`, {code: data.code}, {
            headers: {
                "Authorization": `Bearer ${token}`,
            }
        })
        .then((response) => {
            console.log("response 2fa enable", response);
            dispatch(addAlert({message: "Two-Factor Authentication Activated", type: AlertType.SUCCESS}));
            setDisplayQRCode({show: false, qrcode: undefined});
            dispatch(change2faStatus(true));
        })
        .catch(err => {
            console.log(err);
            setError("code", {message: "Code incorrect"});
        })
    })

    return (
        <div className="qrcode-wrapper">
            <img src={qrcode} alt="QR Code" />
            <form onSubmit={codeSubmit}>
            <label>
                    Enter Your Code
                    { errors && errors.code && <p className='txt-form-error'> {errors.code.message} </p> }
                    <input
                        type="text"
                        {...register("code", {
                            required: "Code is required",
                        })}
                    />
                </label>
                <button> Send </button>
            </form>
        </div>
    );
}

export default SettingsCardInfos;