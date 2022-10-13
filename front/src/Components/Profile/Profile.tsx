import { useState, useContext, useEffect } from "react";
import { ModalContext } from "../Utils/ModalProvider";

import StatsInfoItem from "./Stats-Info-Item";
import RenderProfileBlock from "./Render-Profile-Block";
import CardInfo from "./Card-Info";
import LoadingSpin from "../Utils/Loading-Spin";

import { ProfileState } from "../../Types/User-Types";
import { useAppSelector } from '../../Redux/Hooks';
import { useParams } from "react-router-dom";
import axios from "axios";
import { baseUrl } from "../../env";

import { getMatchPlayed, getWinRate } from "../../Utils/Utils-User";

interface ProfileMenuButtons {
    title: string;
    isActive: string;
}

function Profile() {
    const [attributes, setAttributes] = useState<ProfileMenuButtons[]>([
        { title: "Achievements", isActive: "true" },
        { title: "Matches", isActive: "false" },
        { title: "Friends", isActive: "false" }
    ]);
    const [userState, setUserState] = useState<ProfileState | undefined>(undefined);
    
    const params = useParams();
    const modalStatus = useContext(ModalContext);
    let {currentUser, token} = useAppSelector(state => state.auth);
    
    const handleClick = (index: number) => {
       let newArray = [...attributes];

       newArray.find(elem => elem.isActive === "true")!.isActive = "false";
       newArray[index].isActive = "true";
       setAttributes(newArray);
    }

    useEffect(() => {
        if (params.username === currentUser?.username) {
            // setUserDatas(currentUser);
            setUserState({
                isLoggedUser: false,
                user: currentUser!,
            });
        }
        else {
            axios.get(`${baseUrl}/users/?${params.username}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                }
            })
            .then(response => {
                console.log(response);
                // setUserState({
                //     isLoggedUser: false,
                //     user: response.data,
                // });
            })
            .catch(err => {
                console.log(err);
            })
        }
    }, [params])

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