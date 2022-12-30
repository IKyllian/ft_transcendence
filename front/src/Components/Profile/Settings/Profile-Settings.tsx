import { useAppSelector } from "../../../Redux/Hooks";
import LoadingSpin from "../../Utils/Loading-Spin";
import SettingsCardAvatar from "./Settings-Card-Avatar";
import SettingsCardInfos from "./Settings-Card-Infos";

function ProfileSettings() {
    const {currentUser} = useAppSelector(state => state.auth);

    return currentUser ? (
        <div className="profile-settings-container">
            <div className="settings-wrapper">
                <SettingsCardAvatar />
                <SettingsCardInfos currentUser={currentUser!} />
            </div>
        </div>
    ) : (
        <div className="profile-settings-container">
            <LoadingSpin />
        </div>
    );
}

export default ProfileSettings;