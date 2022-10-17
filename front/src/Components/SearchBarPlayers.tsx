import { useEffect, useState } from "react";
import { IconSearch } from "@tabler/icons";
import UserFindItem from "./User-Find-Item";
import { UserInterface } from "../Types/User-Types";
import axios from "axios";
import { baseUrl } from "../env";
import { useAppSelector } from "../Redux/Hooks";
import Avatar from "../Images-Icons/pp.jpg"

function SearchBarButtons(props: {functionality: string, userId?: number, register?: any}) {
    const { functionality, userId, register } = props;
    console.log(userId);
    if (functionality === "addFriend") {
        return (
            <button> Add friend </button>
        );
    } else if (functionality === "chanInvite") {
        return (
            <input
                type="checkbox"
                value={userId}
                {...register("usersIdInvited")}
            />
        );
    } else {
        return (
            <button> Send message </button>
        );
    }
}

function SearchBarPlayers(props: {functionality: string, register?: any}) {
    const [inputText, setInputText] = useState<string>("");
    const [usersList, setUsersList] = useState<UserInterface[] | undefined>(undefined);
    const {functionality, register} = props;
    const {token} = useAppSelector(state => state.auth);

    const handleChange = (e: any) => {
        setInputText(e.target.value);
    }

    useEffect(() => {
        if (inputText.length > 0) {
            axios.post(`${baseUrl}/users/search`, {str: inputText}, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                }
            })
            .then((response) => {
                setUsersList(response.data);   
            })
            .catch((err) => {
                console.log(err);
            })
        } else
            setUsersList([]);
       
    }, [inputText])

    return (
        <div className='search-player-container'>
            <div className="modal-search">
                <IconSearch />
                <input type="text" placeholder="Search a user" value={inputText} onChange={(e) => handleChange(e)} />
            </div>
            <div className="modal-player-list">
                {
                    usersList && usersList.length > 0 &&
                    usersList.map((elem, index) =>
                        <UserFindItem key={index} avatar={Avatar} name={elem.username} >
                            {
                                functionality === "chanInvite"
                                ? <SearchBarButtons functionality={functionality} userId={elem.id} register={register} />
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