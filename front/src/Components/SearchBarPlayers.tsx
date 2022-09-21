import { useEffect, useState } from "react";
import { IconSearch } from "@tabler/icons";

import { usersArray } from "../Types/Datas-Examples"
import { ExampleUser } from "../Types/User-Types";
import UserFindItem from "./User-Find-Item";

function SearchBarButtons(props: {functionality: string}) {
    const { functionality } = props;
    if (functionality === "addFriend") {
        return (
            <button> Add friend </button>
        );
    } else if (functionality === "chanInvite") {
        return (
            <input type="checkbox" />
        );
    } else {
        return (
            <button> Send message </button>
        );
    }
}

function SearchBarPlayers(props: {functionality: string}) {
    const [inputText, setInputText] = useState<string>("");
    const [arrayResult, setArrayResult] = useState<ExampleUser[]>([]);

    const {functionality} = props;

    const handleChange = (e: any) => {
        setInputText(e.target.value);
    }

    useEffect(() => {
        if (inputText.length > 0) {
            let newArray: ExampleUser[] = [];

            newArray = usersArray.filter(elem => ((elem.username.toLowerCase().includes(inputText.toLowerCase())) === true));
            setArrayResult(newArray);
        } else {
            setArrayResult([]);
        }
    }, [inputText])

    return (
        <div className='search-player-container'>
            <div className="modal-search">
                <IconSearch />
                <input type="text" placeholder="Search a user" value={inputText} onChange={(e) => handleChange(e)} />
            </div>
            <div className="modal-player-list">
                {
                    arrayResult.map((elem, index) =>
                        <UserFindItem key={index} avatar={elem.profilPic} name={elem.username} >
                            <SearchBarButtons functionality={functionality} />
                        </UserFindItem>
                    )
                }
            </div>
        </div>
    );
}

export default SearchBarPlayers;