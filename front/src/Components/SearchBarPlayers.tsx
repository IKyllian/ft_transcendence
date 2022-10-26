import { ReactNode, useEffect, useState } from "react";
import { IconSearch } from "@tabler/icons";
import UserFindItem from "./User-Find-Item";
import { UserInterface } from "../Types/User-Types";
import { useAppDispatch, useAppSelector } from "../Redux/Hooks";
import Avatar from "../Images-Icons/pp.jpg"
import { fetchConvAndRedirect } from "../Api/Chat/Chat-Fetch";
import { useNavigate, useParams } from "react-router-dom";

interface SearchBarButtonsProps {
    functionality: string,
    user?: UserInterface,
    checkboxOnChange?: Function,
    checkboxArray?: UserInterface[],
    handleSendMessage?: Function,
}

function SearchBarButtons(props: SearchBarButtonsProps) {
    const { functionality, user, checkboxOnChange, checkboxArray, handleSendMessage } = props;
   
    if (functionality === "addFriend") {
        return (
            <button> Add friend </button>
        );
    } else if (functionality === "chanInviteOnCreate" || functionality === "chanInvite") {
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
            <button onClick={() => handleSendMessage!()}> Send message </button>
        );
    }
}

function SearchBarPlayers(props: {functionality: string, checkboxOnChange?: Function, checkboxArray?: UserInterface[], fetchUserFunction: Function}) {
    const {functionality, checkboxOnChange, checkboxArray, fetchUserFunction} = props;
    const [inputText, setInputText] = useState<string>("");
    const [usersList, setUsersList] = useState<UserInterface[] | undefined>(undefined);
    const {token, currentUser} = useAppSelector(state => state.auth);
    const {privateConv} = useAppSelector(state => state.chat);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const params = useParams();

    const handleChange = (e: any) => {
        setInputText(e.target.value);
    }

    const handleSendMessage = (userIdToSend: number) => {
        fetchConvAndRedirect(currentUser!, userIdToSend, token, privateConv, dispatch, navigate);
    }

    useEffect(() => {
        if (inputText.length > 0) {
            if (functionality !== "chanInvite")
                fetchUserFunction(inputText, token, setUsersList);
            else {
                if (params.channelId)
                    fetchUserFunction(inputText, token, setUsersList, parseInt(params.channelId));
            }
        }
    }, [inputText])

    const renderSearchBarButton = (parameters: SearchBarButtonsProps): ReactNode => {
        const { functionality, user, checkboxOnChange, checkboxArray, handleSendMessage } = parameters;
        if (functionality === "chanInviteOnCreate" || functionality === "chanInvite")
            return <SearchBarButtons functionality={functionality} user={user} checkboxOnChange={checkboxOnChange} checkboxArray={checkboxArray} />
        else if (functionality === "addFriend")
            return <SearchBarButtons functionality={functionality}  />
        else
            return <SearchBarButtons functionality={functionality} handleSendMessage={() => handleSendMessage!(user?.id)} />
    }

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
                            { renderSearchBarButton({functionality: functionality, user: elem, checkboxOnChange: checkboxOnChange, checkboxArray: checkboxArray, handleSendMessage: handleSendMessage}) }
                        </UserFindItem>
                    )
                }
                {
                    inputText.length === 0 && checkboxArray && checkboxArray.length > 0 &&
                    checkboxArray.map((elem, index) =>
                        <UserFindItem key={index} avatar={Avatar} name={elem.username} >
                            { renderSearchBarButton({functionality: functionality, user: elem, checkboxOnChange: checkboxOnChange, checkboxArray: checkboxArray, handleSendMessage: handleSendMessage}) }
                        </UserFindItem>
                    )
                }
            </div>
        </div>
    );
}

export default SearchBarPlayers;