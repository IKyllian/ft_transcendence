
function SettingsCardInfos() {
    return (
        <div className="user-infos-card">
            <h3> Edit Profile </h3>
            <form>
                <label>
                    Username
                    <input type="text" />
                </label>
                <label>
                    Email
                    <input type="text" />
                </label>
                <label>
                    Password
                    <input type="password" />
                </label>
                <button type="submit"> Update Infos </button>
            </form>

            <button> Activate Two-Factor Authentication </button>
        </div>
    );
}

export default SettingsCardInfos;