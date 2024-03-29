import StatsInfoItem from "./Stats-Info-Item";
import RenderProfileBlock from "./Render-Profile-Block";
import CardInfo from "./Card-Info";
import LoadingSpin from "../Utils/Loading-Spin";
import { getDoublesWinRate, getMatchPlayed, getSinglesWinRate } from "../../Utils/Utils-User";
import { useProfileHook } from "../../Hooks/Profile/Profile-Hook";
import { Modes } from "../../Types/Utils-Types";
import Error404 from "../404-Error";

function Profile() {
    const {
        userState,
        handleClick,
        modalStatus,
        attributes,
        statsMode,
        changeMode,
        loading,
    } = useProfileHook();

    if (loading)
        return <LoadingSpin classContainer="profile-container" />;

    return !loading && userState ? (
            <div className={`profile-container ${modalStatus.modal.isOpen ? modalStatus.modal.blurClass : ""}`}>
            <div className="profile-header">
                <div className='stats-infos'>
                    <select onChange={(e) => changeMode(e)} value={statsMode} className="mode-select">
                        <option value={Modes.Singles}> {Modes.Singles} </option>
                        <option value={Modes.Doubles}> {Modes.Doubles} </option>
                    </select>
                    <StatsInfoItem label="games played" value={getMatchPlayed(statsMode === Modes.Singles ? userState.user.statistic.singles_match_won : userState.user.statistic.doubles_match_won, statsMode === Modes.Singles ? userState.user.statistic.singles_match_lost : userState.user.statistic.doubles_match_lost).toString()} />
                    <StatsInfoItem label="win rate" value={`${statsMode === Modes.Singles ? getSinglesWinRate(userState.user) : getDoublesWinRate(userState.user)}%`} />
                    <StatsInfoItem label="rank" elo={statsMode === Modes.Singles ? userState.user.singles_elo : userState.user.doubles_elo} />
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
                <RenderProfileBlock blockTitle={attributes.find(elem => elem.isActive === "true")!.title} userDatas={userState.user} friendList={userState.friendList} matchHistory={userState.match_history} />
            </div>
        </div>
    ) : (
        <Error404 /> 
    );
}

export default Profile;