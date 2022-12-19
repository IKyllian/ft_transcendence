import { useState } from "react";
import { useForm } from "react-hook-form";
import api from "../../../Api/Api";
import { fetchInterceptor } from "../../../Api/Interceptor-Fetch";
import { baseUrl } from "../../../env";
import { addAlert, AlertType } from "../../../Redux/AlertSlice";
import { change2faStatus, replaceUserObject } from "../../../Redux/AuthSlice";
import { useAppDispatch } from "../../../Redux/Hooks";
import { UserInterface } from "../../../Types/User-Types";
import { TokenStorageInterface } from "../../../Types/Utils-Types";

function SettingsCardInfos(props: {currentUser: UserInterface }) {
    const { currentUser } = props;
    return (
        <div className="user-infos-card">
            <UsernameForm user={currentUser} />
            <PasswordForm />
            <TwoFactor user={currentUser} />
        </div>
    );
}

function TwoFactor(props: {user: UserInterface}) {
    const { user } = props;
    const [displayQRCode, setDisplayQRCode] = useState<{show: boolean, qrcode: string | undefined}>({show: false, qrcode: undefined});
    const [disable2fa, setDisable2fa] = useState<boolean>(false);

    const enableTwoFactor = () => {
        const localToken: string | null = localStorage.getItem("userToken");
		if (localToken !== null) {
			const localTokenParse: TokenStorageInterface = JSON.parse(localToken);
            const req = new Request(`${baseUrl}/2fa/generate`, {method: 'POST', body: undefined ,headers: {"Authorization": `Bearer ${localTokenParse.access_token}`}});
            fetchInterceptor();
            fetch(req)
            .then(async (response) => {
                const avatarBlob = await response.blob();
                const qrCodeUrl = URL.createObjectURL(avatarBlob)
                setDisplayQRCode({show: true, qrcode: qrCodeUrl});
            }) 
            .catch(err => {
                console.log("err", err);
            })
        }
    }
    
    return (
        <div>
            { !displayQRCode.show && !user.two_factor_enabled && <button onClick={() => enableTwoFactor()}> Activate Two-Factor Authentication </button> }
            { !displayQRCode.show && user.two_factor_enabled && !disable2fa && <button onClick={() => setDisable2fa(true)}> Disable Two-Factor Authentication </button> }
            {
                displayQRCode.show && displayQRCode.qrcode &&
                <QRCodeValidation qrcode={displayQRCode.qrcode} setDisplayQRCode={setDisplayQRCode} />
            }
            { !displayQRCode.show && user.two_factor_enabled && disable2fa && <Disable2fa /> }
        </div>

    );
}

function PasswordForm() {
    const {register, handleSubmit, formState: {errors}, setError, resetField} = useForm<{oldPassword: string, newPassword: string}>();
    const dispatch = useAppDispatch();

    const passwordSubmit = handleSubmit((data, e) => {
        e?.preventDefault();
        api.patch(`/users/edit-password`, {old: data.oldPassword, new: data.newPassword})
        .then(response => {
            console.log("Response Edit PAssword", response);
            resetField("oldPassword");
            resetField("newPassword");
            dispatch(addAlert({message: "Password changed", type: AlertType.SUCCESS}));
        })
        .catch(err => {
            console.log("ERR", err);
            setError("oldPassword", {message: "Password incorrect"});
        })
    })

    return (
        <form onSubmit={passwordSubmit}>
            <label>
                Old Password
                { errors && errors.oldPassword && <p className='txt-form-error'> {errors.oldPassword.message} </p> }
                <input
                    type="password"
                    {...register("oldPassword", {
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
                { errors && errors.newPassword && <p className='txt-form-error'> {errors.newPassword.message} </p> }
                <input
                    type="password"
                    {...register("newPassword", {
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
    );

}

function UsernameForm(props: {user: UserInterface}) {
    const { user } = props;

    const {register, watch, handleSubmit, formState: {errors}, setError, resetField} = useForm<{username: string}>({defaultValues: {username: user.username}});
    const dispatch = useAppDispatch();

    const watchUsersame = watch("username");

    const usernameSubmit = handleSubmit((data, e) => {
        e?.preventDefault();
        api.patch(`/users/edit-username`, {username: data.username})
        .then(response => {
            console.log("response Edit username", response.data);
            dispatch(replaceUserObject(response.data));
            dispatch(addAlert({message: "Username changed", type: AlertType.SUCCESS}));
        })
        .catch(err => {
            console.log(err);
            setError("username", {message: "Username already exist"});
        })
    })
    return (
        <>
            <h3> Edit Profile </h3>
            <form onSubmit={usernameSubmit}>
                <div>
                    <label>
                        Username
                        { errors && errors.username && <p className='txt-form-error'> {errors.username.message} </p> }
                        <div className="label-input-wrapper">
                            <input
                                type="text"
                                {...register("username", {
                                    minLength: {
                                        value: 2,
                                        message: "Min length is 2"
                                    },
                                    required: "Username is required"
                                    
                                })}
                            />
                            { watchUsersame !== user.username && <button className="username-save" type="submit"> Save </button> }
                        </div>
                    </label>
                </div>
                <label >
                    Email
                    <input disabled className="lock-input" type="text" value={user.email} />
                </label>
            </form>
        </>
    );
}

function Disable2fa() {
    const {register, handleSubmit, formState: {errors}, setError} = useForm<{code: string}>();
    const dispatch = useAppDispatch();

    const codeSubmit = handleSubmit((data, e) => {
        e?.preventDefault();
        api.post(`/2fa/disable`, {code: data.code})
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

function QRCodeValidation(props: {qrcode: string, setDisplayQRCode: Function}) {
    const { qrcode, setDisplayQRCode } = props
    const {register, handleSubmit, formState: {errors}, setError} = useForm<{code: string}>();
    const dispatch = useAppDispatch();

    const codeSubmit = handleSubmit((data, e) => {
        e?.preventDefault();
        api.post(`/2fa/enable`, {code: data.code})
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
            <label className="label-qrcode">
                    Scan your QRCode on the Google Auth App and enter your code
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