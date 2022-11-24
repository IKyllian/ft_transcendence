import { IconLock } from "@tabler/icons";
import { useForm } from "react-hook-form";
import { UserInterface } from "../../../Types/User-Types";

function SettingsCardInfos(props: {currentUser: UserInterface}) {
    const { currentUser } = props;
    console.log("currentUser", currentUser);
    const {register, watch} = useForm<{username: string}>({defaultValues: {username: currentUser?.username}});

    const watchUsersame = watch("username");
    return (
        <div className="user-infos-card">
            <h3> Edit Profile </h3>
            <form>
                <div>
                    <label>
                        Username
                        <div className="lock-input-wrapper">
                            <input type="text" {...register("username")} />
                            { watchUsersame !== currentUser.username && <button className="username-save" type="submit"> Save </button> }
                        </div>
                    </label>
                </div>
                <label >
                    Email
                    <div className="lock-input-wrapper">
                        <input disabled className="lock-input" type="text" value={currentUser.email} />
                        <IconLock />
                    </div>
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