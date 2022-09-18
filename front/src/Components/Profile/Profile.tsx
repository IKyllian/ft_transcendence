import { useState, useContext, useEffect } from "react";
import { ModalContext } from "../ModalProvider";

import StatsInfoItem from "./Items/Stats-Info-Item";
import RenderProfileBlock from "./Render-Profile-Block";
import CardInfo from "./Card-Info";
import LoadingSpin from "../Loading-Spin";

import { UserInterface } from "../../Types/User-Types";
import { useAppSelector } from '../../Redux/Hooks';
import { useParams } from "react-router-dom";
import axios from "axios";

import { getMatchPlayed, getWinRate } from "../../Utils/Utils-User";

interface profileMenuButtons {
    title: string;
    isActive: string;
}

function Profile() {
    const [attributes, setAttributes] = useState<profileMenuButtons[]>([
        { title: "Achievements", isActive: "true" },
        { title: "Matches", isActive: "false" },
        { title: "Friends", isActive: "false" }
    ]);
    const [userDatas, setUserDatas] = useState<UserInterface | undefined>(undefined);
    
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
        if (params.username === currentUser?.username)
            setUserDatas(currentUser);
        // else {
        //     axios.get('http://localhost:5000/api/users/get-user', {
        //         headers: {
        //             "Authorization": `Bearer ${token}`,
        //         }
        //     })
        //     .then(response => {
        //         console.log(response);
        //     })
        //     .catch(err => {
        //         console.log(err);
        //     })
        // }
    }, [userDatas, params])

    return !userDatas ? (
       <LoadingSpin classContainer="profile-container" />
    ) : (
        <div className={`profile-container ${modalStatus.modal.isOpen ? modalStatus.modal.blurClass : ""}`}>
            <div className="profile-header">
                <div className='stats-infos'>
                    <StatsInfoItem label="Games Played" value={getMatchPlayed(userDatas).toString()} />
                    <StatsInfoItem label="Win Rate" value={`${getWinRate(userDatas).toString()}%`} />
                    <StatsInfoItem label="Rank" value="#3" />
                </div>
                <CardInfo userDatas={userDatas} />
            </div>
            <div className="profile-main">
                <div className="profile-main-menu">
                    {
                        attributes.map((elem, index) =>
                            <p key={index} onClick={() => handleClick(index)} is-target={elem.isActive}> {elem.title} </p>
                        )
                    }
                </div>
                <RenderProfileBlock blockTitle={attributes.find(elem => elem.isActive === "true")!.title} userDatas={userDatas} />
            </div>
        </div>
    );
}

export default Profile;