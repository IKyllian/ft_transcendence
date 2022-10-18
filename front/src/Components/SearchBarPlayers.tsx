import { ReactNode, useEffect, useState } from "react";
import { IconSearch } from "@tabler/icons";
import UserFindItem from "./User-Find-Item";
import { UserInterface } from "../Types/User-Types";
import axios from "axios";
import { baseUrl } from "../env";
import { useAppSelector } from "../Redux/Hooks";
import Avatar from "../Images-Icons/pp.jpg"
import { fetchSearchAllUsers } from "../Api/User-Fetch";

function SearchBarButtons(props: {functionality: string, user?: UserInterface, checkboxOnChange?: Function, checkboxArray?: UserInterface[]}) {
    const { functionality, user, checkboxOnChange, checkboxArray } = props;
   
    if (functionality === "addFriend") {
        return (
            <button> Add friend </button>
        );
    } else if (functionality === "chanInvite") {
        return (
            <input
                type="checkbox"
                value={user?.id}
                onChange={() => checkboxOnChange!(user)}
                checked={checkboxArray && checkboxArray.find((val : UserInterface) => val.id === user?.id) ? true : false}
        />
        );
    } else {
        return (
            <button> Send message </button>
        );
    }
}

function SearchBarPlayers(props: {functionality: string, checkboxOnChange?: Function, checkboxArray?: UserInterface[]}) {
    const [inputText, setInputText] = useState<string>("");
    const [usersList, setUsersList] = useState<UserInterface[] | undefined>(undefined);
    const {functionality, checkboxOnChange, checkboxArray} = props;
    const {token} = useAppSelector(state => state.auth);

    const handleChange = (e: any) => {
        setInputText(e.target.value);
    }

    useEffect(() => {
        if (inputText.length > 0)
            fetchSearchAllUsers(inputText, token, setUsersList);
    }, [inputText])

    return (
        <div className='search-player-container'>
            <div className="modal-search">
                <IconSearch />
                <input type="text" placeholder="Search a user" value={inputText} onChange={(e) => handleChange(e)} />
            </div>
            <div className="modal-player-list">
                {
                    inputText.length > 0 && usersList && usersList.length > 0 &&
                    usersList.map((elem, index) =>
                        <UserFindItem key={index} avatar={Avatar} name={elem.username} >
                            {
                                functionality === "chanInvite"
                                ? <SearchBarButtons functionality={functionality} user={elem} checkboxOnChange={checkboxOnChange} checkboxArray={checkboxArray} />
                                : <SearchBarButtons functionality={functionality} />
                            }
                        </UserFindItem>
                    )
                }
                {
                    inputText.length === 0 && checkboxArray && checkboxArray.length > 0 &&
                    checkboxArray.map((elem, index) =>
                        <UserFindItem key={index} avatar={Avatar} name={elem.username} >
                            {
                                functionality === "chanInvite"
                                ? <SearchBarButtons functionality={functionality} user={elem} checkboxOnChange={checkboxOnChange} checkboxArray={checkboxArray} />
                                : <SearchBarButtons functionality={functionality} />
                            }
                        </UserFindItem>
                    )
                }
            </div>
        </div>
    );
}

export default SearchBarPlayers;