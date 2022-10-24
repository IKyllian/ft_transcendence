import { ReactNode, useEffect, useState, useCallback, useContext } from "react";
import { IconSearch, IconCheck, IconX } from "@tabler/icons";
import UserFindItem from "./User-Find-Item";
import { UserInterface } from "../../Types/User-Types";
import { useAppDispatch, useAppSelector } from "../../Redux/Hooks";
import Avatar from "../../Images-Icons/pp.jpg"
import { fetchConvAndRedirect } from "../../Api/Chat/Chat-Fetch";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { debounce } from "../../Utils/Utils-Chat";
import { SocketContext } from "../../App";

interface SearchBarButtonsProps {
    functionality: string,
    user?: UserInterface,
    checkboxOnChange?: Function,
    checkboxArray?: UserInterface[],
    handleSendMessage?: Function,
    userFromList?: UsersListInterface,
    // setRequestIsSend?: Function,
}

interface UsersListInterface {
    user: UserInterface,
    relationStatus?: string,
}

function SearchBarButtons(props: SearchBarButtonsProps) {
    const { functionality, user, checkboxOnChange, checkboxArray, handleSendMessage, userFromList} = props;

    const {socket} = useContext(SocketContext);
    const handleAddFriend = () => {
        socket?.emit("FriendRequest", {
            id: userFromList?.user.id,
        });
        // setRequestIsSend!((prev:any) => {return !prev});
    }
   
    if (functionality === "addFriend") {
        if (userFromList?.relationStatus === "none") {
            return (<button onClick={() => handleAddFriend()}> Add friend </button>);
        } else if (userFromList?.relationStatus === "pending") {
            return (<p> pending </p>);
        } else {
            return (
                <div className="friendship-action-wrapper">
                    <IconCheck />
                    <IconX />
                </div>
            )
        }
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
    const { register, reset, formState: {errors}, getValues } = useForm<{textInput: string}>();
    const [usersList, setUsersList] = useState<UsersListInterface[] | undefined>(undefined);
    // const [requestIsSend, setRequestIsSend] = useState<boolean>(false);
    const {token, currentUser} = useAppSelector(state => state.auth);
    const {privateConv} = useAppSelector(state => state.chat);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const params = useParams();
 
    const handleSendMessage = (userIdToSend: number) => {
        fetchConvAndRedirect(currentUser!, userIdToSend, token, privateConv, dispatch, navigate);
    }

    const endOfTyping = () => {
        if (getValues('textInput') && getValues('textInput').length > 0) {
            if (functionality !== "chanInvite")
                fetchUserFunction(getValues('textInput'), token, setUsersList);
            else {
                if (params.channelId)
                    fetchUserFunction(getValues('textInput'), token, setUsersList, parseInt(params.channelId));
            }
        } else {
            setUsersList([]);
        }
    }

    const optimizedFn = useCallback(debounce(endOfTyping, 700), []);

    const renderSearchBarButton = (parameters: SearchBarButtonsProps): ReactNode => {
        const { functionality, user, checkboxOnChange, checkboxArray, handleSendMessage, userFromList } = parameters;
        if (functionality === "chanInviteOnCreate" || functionality === "chanInvite")
            return <SearchBarButtons functionality={functionality} user={user} checkboxOnChange={checkboxOnChange} checkboxArray={checkboxArray} />
        else if (functionality === "addFriend")
            return <SearchBarButtons functionality={functionality} userFromList={userFromList}  />
        else
            return <SearchBarButtons functionality={functionality} handleSendMessage={() => handleSendMessage!(user?.id)} />
    }

    return (
        <div className='search-player-container'>
            <div className="modal-search">
                <IconSearch />
                <input type="text" placeholder="Search a user" {...register('textInput', {onChange: () => {optimizedFn()}})} />
            </div>
            <div className="modal-player-list">
                {
                    getValues('textInput') && getValues('textInput').length > 0 && usersList && usersList.length > 0 &&
                    usersList.map((elem, index) =>
                        <UserFindItem key={index} avatar={Avatar} name={elem.user.username} >
                            { renderSearchBarButton({functionality: functionality, user: elem.user, checkboxOnChange: checkboxOnChange, checkboxArray: checkboxArray, handleSendMessage: handleSendMessage, userFromList: elem}) }
                        </UserFindItem>
                    )
                }
                {
                    !getValues('textInput') && checkboxArray && checkboxArray.length > 0 &&
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