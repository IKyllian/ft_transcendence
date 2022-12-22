import { ReactNode, useEffect, useState, useCallback, useContext } from "react";
import { UsersListInterface } from "../Types/User-Types";
import { useAppDispatch, useAppSelector } from "../Redux/Hooks";
import { fetchConvAndRedirect } from "../Api/Chat/Chat-Fetch";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { debounce } from "../Utils/Utils-Chat";
import { SocketContext } from "../App";
import SearchBarButtons from "../Components/Search-Bar/SearchBar-Buttons";
import { SearchBarButtonsProps } from "../Types/Utils-Types";
import { SearchBarFunctionality } from "../Types/Utils-Types";

export function useSearchBarHook(props: {functionality: SearchBarFunctionality, fetchUserFunction: Function}) {
    const {functionality, fetchUserFunction} = props;
    const { register, formState: {errors}, getValues } = useForm<{textInput: string}>();
    const [usersList, setUsersList] = useState<UsersListInterface[] | undefined>(undefined);

    const {currentUser} = useAppSelector(state => state.auth);
    const {privateConv} = useAppSelector(state => state.chat);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const params = useParams();
    const {socket} = useContext(SocketContext);
 
    const handleSendMessage = (userIdToSend: number) => {
        fetchConvAndRedirect(currentUser!, userIdToSend, privateConv, dispatch, navigate);
    }

    useEffect(() => {
        socket?.on("RelationUpdate", (data: {id: number, relation: string}) => {
            if (data.relation === "friend") {
                setUsersList((prev: UsersListInterface[] | undefined) => { return prev !== undefined ? [...prev.filter(elem => elem.user.id !== data.id)] : undefined})
            } else {
                setUsersList((prev: UsersListInterface[] | undefined) => { return prev !== undefined ? [...prev.map(elem => {
                    if (elem.user.id === data.id)
                        return {...elem, relationStatus: data.relation};
                    else
                        return elem;   
                })] : undefined})
            }
        });

        return () => {
            socket?.off("RelationUpdate");
        }
    }, [])

    const endOfTyping = () => {
        if (getValues('textInput') && getValues('textInput').length > 0) {
            if (functionality !== SearchBarFunctionality.CHAN_INVITE)
                fetchUserFunction(getValues('textInput'), setUsersList);
            else {
                if (params.channelId)
                    fetchUserFunction(getValues('textInput'), setUsersList, +params.channelId);
            }
        } else {
            setUsersList([]);
        }
    }

    const optimizedFn = useCallback(debounce(endOfTyping, 700), []);

    const renderSearchBarButton = (parameters: SearchBarButtonsProps): ReactNode => {
        const { functionality, user, checkboxOnChange, checkboxArray, handleSendMessage, userFromList } = parameters;
        if (functionality === SearchBarFunctionality.CHAN_INVITE_ON_CREATE || functionality === SearchBarFunctionality.CHAN_INVITE)
            return <SearchBarButtons functionality={functionality} user={user} checkboxOnChange={checkboxOnChange} checkboxArray={checkboxArray} />
        else if (functionality === SearchBarFunctionality.ADD_FRIEND)
            return <SearchBarButtons functionality={functionality} userFromList={userFromList}  />
        else if (functionality === SearchBarFunctionality.PARTY_INVITE)
            return <SearchBarButtons functionality={functionality} user={user}  />
        else
            return <SearchBarButtons functionality={functionality} handleSendMessage={() => handleSendMessage!(user?.id)} />
    }

    return {
        formHook: {
            register: register,
            getValues: getValues
        },
        usersList,
        optimizedFn,
        handleSendMessage,
        renderSearchBarButton,
    };
}