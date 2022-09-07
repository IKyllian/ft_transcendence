import { useState, useContext } from "react";
import { ModalContext } from "../ModalProvider";

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

    const modalStatus = useContext(ModalContext);
    
    const handleClick = (index: number) => {
       let newArray = [...attributes];

       newArray.find(elem => elem.isActive === "true")!.isActive = "false";
       newArray[index].isActive = "true";
       setAttributes(newArray);
    }

    return (
        <div className={`profile-container ${modalStatus.modal.isOpen ? modalStatus.modal.blurClass : ""}`}>
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
    );
}

export default Profile;