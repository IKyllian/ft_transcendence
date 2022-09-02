import { useState } from "react";
import { RootState } from '../../Redux/Store'
import { useAppSelector } from '../../Redux/Hooks'
import { ModalState } from "../../Interfaces/Interface-Modal";

import Header from "../Header/Header";
import StatsInfoItem from "./Items/Stats-Info-Item";
import RenderProfileBlock from "./Render-Profile-Block";
import CardInfo from "./Card-Info";

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

    const modalStatus: ModalState =  useAppSelector((state: RootState) => state.modal);
    
    const handleClick = (index: number) => {
       let newArray = [...attributes];

       newArray.find(elem => elem.isActive === "true")!.isActive = "false";
       newArray[index].isActive = "true";
       setAttributes(newArray);
    }

    return (
        <>
            <Header />
            <div className={`profile-container ${modalStatus.isOpen ? modalStatus.blurClass : ""}`}>
                <div className="profile-header">
                    <div className='stats-infos'>
                        <StatsInfoItem label="Games Played" value="100" />
                        <StatsInfoItem label="Win Rate" value="50%" />
                        <StatsInfoItem label="Rank" value="3" />
                    </div>
                    <CardInfo />
                </div>
                <div className="profile-main">
                    <div className="profile-main-menu">
                        {
                            attributes.map((elem, index) =>
                                <p key={index} onClick={() => handleClick(index)} is-target={elem.isActive}> {elem.title} </p>
                            )
                        }
                    </div>
                    <RenderProfileBlock blockTitle={attributes.find(elem => elem.isActive === "true")!.title} />
                </div>
            </div>
        </>
    );
}

export default Profile;