import SettingsCardAvatar from "./Settings-Card-Avatar";
import SettingsCardInfos from "./Settings-Card-Infos";

function ProfileSettings() {
    return (
        <div className="profile-settings-container">
            <SettingsCardAvatar />
            <SettingsCardInfos />
        </div>
    );
}

export default ProfileSettings;