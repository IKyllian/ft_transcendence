import React, { useState } from "react";

import Header from "../Header/Header";
import StatsInfoItem from "./Items/Stats-Info-Item";
import RenderProfileBlock from "./Render-Profile-Block";
import CardInfo from "./Card-Info";

interface profileMenuButtons {
    title: string;
    isActive: string;
}

function Profile2() {

    const [attributes, setAttributes] = useState<profileMenuButtons[]>([
        { title: "Achievements", isActive: "true" },
        { title: "Matches", isActive: "false" },
        { title: "Friends", isActive: "false" }
    ]);
    
    const handleClick = (index: number) => {
       let newArray = [...attributes];

       newArray.find(elem => elem.isActive === "true")!.isActive = "false";
       newArray[index].isActive = "true";
       setAttributes(newArray);
    }

    return (
        <>
            <Header />
            <div className="profile2-container">
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

export default Profile2;