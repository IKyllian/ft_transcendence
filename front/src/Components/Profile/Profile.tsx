import StatsInfoItem from "./Stats-Info-Item";
import RenderProfileBlock from "./Render-Profile-Block";
import CardInfo from "./Card-Info";
import LoadingSpin from "../Utils/Loading-Spin";
import { getMatchPlayed, getWinRate } from "../../Utils/Utils-User";
import { useProfileHook } from "../../Hooks/Profile/Profile-Hook";

function Profile() {
    const {
        userState,
        handleClick,
        modalStatus,
        attributes,
    } = useProfileHook();

    return !userState?.user ? (
       <LoadingSpin classContainer="profile-container" />
    ) : (
        <div className={`profile-container ${modalStatus.modal.isOpen ? modalStatus.modal.blurClass : ""}`}>
            <div className="profile-header">
                <div className='stats-infos'>
                    <StatsInfoItem label="Games Played" value={getMatchPlayed(userState.user).toString()} />
                    <StatsInfoItem label="Win Rate" value={`${getWinRate(userState.user).toString()}%`} />
                    <StatsInfoItem label="Rank" value="#3" />
                </div>
                <CardInfo userState={userState} />
            </div>
            <div className="profile-main">
                <div className="profile-main-menu">
                    {
                        attributes.map((elem, index) =>
                            <p key={index} onClick={() => handleClick(index)} is-target={elem.isActive}> {elem.title} </p>
                        )
                    }
                </div>
                <RenderProfileBlock blockTitle={attributes.find(elem => elem.isActive === "true")!.title} userDatas={userState.user} />
            </div>
        </div>
    );
}

export default Profile;