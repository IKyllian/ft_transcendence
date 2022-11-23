import { useForm } from "react-hook-form";
import { UserInterface } from "../../../Types/User-Types";

function SettingsCardInfos(props: {currentUser: UserInterface}) {
    const { currentUser } = props;
    console.log("currentUser", currentUser);
    const {register} = useForm<{username: string}>({defaultValues: {username: currentUser.username}});
    return (
        <div className="user-infos-card">
            <h3> Edit Profile </h3>
            <form>
                <div>
                    <label>
                        Username
                        <input type="text" {...register("username")} />
                    </label>
                    {/* <button type="submit"> Update </button> */}
                </div>
                <label className="lock-input">
                    Email
                    <input  disabled type="text" value={currentUser.email} />
                </label>
            </form>
            <form>
                <label>
                    Old Password
                    <input type="password" />
                </label>
                <label>
                    New Password
                    <input type="password" />
                </label>
                <button type="submit"> Change Password </button>
            </form>
            <button> Activate Two-Factor Authentication </button>
        </div>
    );
}

export default SettingsCardInfos;