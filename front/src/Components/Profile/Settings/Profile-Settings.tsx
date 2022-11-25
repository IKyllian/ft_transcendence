import { useAppSelector } from "../../../Redux/Hooks";
import SettingsCardAvatar from "./Settings-Card-Avatar";
import SettingsCardInfos from "./Settings-Card-Infos";

function ProfileSettings() {
    const {currentUser} = useAppSelector(state => state.auth);
    
    return (
        <div className="profile-settings-container">
            <SettingsCardAvatar />
            <SettingsCardInfos currentUser={currentUser!} />
        </div>
    );
}

export default ProfileSettings;