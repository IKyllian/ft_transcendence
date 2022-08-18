import React from "react";

import FriendItem from "../Items/Friend-Item";
import ProfilPic from "../../../Images-Icons/pp.jpg"

interface friendData {
    name: string;
    profilPic: string;
}

const friends: friendData[] = [
    {
        name: "Johan",
        profilPic: ProfilPic,
    }, {
        name: "Karim",
        profilPic: ProfilPic,
    }, {
        name: "Loic",
        profilPic: ProfilPic,
    }, {
        name: "Gersho",
        profilPic: ProfilPic,
    }, {
        name: "Zippy",
        profilPic: ProfilPic,
    }, {
        name: "Owlly",
        profilPic: ProfilPic,
    }, {
        name: "Drow3yyy",
        profilPic: ProfilPic,
    }, {
        name: "Zeeqjr",
        profilPic: ProfilPic,
    },
]

function BlockFriends() {
    return (
        <div className="friends-list">
            {
                friends.map((elem, index) =>
                    <FriendItem key={index} name={elem.name} profilPic={elem.profilPic} />
                )
            }
        </div>
    );
}

export default BlockFriends;