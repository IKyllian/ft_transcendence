import { useAppSelector } from "../../../Redux/Hooks";
import SettingsCardAvatar from "./Settings-Card-Avatar";
import SettingsCardInfos from "./Settings-Card-Infos";

function ProfileSettings() {
    const {currentUser, token} = useAppSelector(state => state.auth);
    
    return (
        <div className="profile-settings-container">
            <div className="settings-wrapper">
                <SettingsCardAvatar />
                <SettingsCardInfos currentUser={currentUser!} />
            </div>
        </div>
    );
}

export default ProfileSettings;