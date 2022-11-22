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

    const {token, currentUser} = useAppSelector(state => state.auth);
    const {privateConv} = useAppSelector(state => state.chat);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const params = useParams();
    const {socket} = useContext(SocketContext);
 
    const handleSendMessage = (userIdToSend: number) => {
        fetchConvAndRedirect(currentUser!, userIdToSend, token, privateConv, dispatch, navigate);
    }

    useEffect(() => {
        socket?.on("RequestValidation", () => {
            fetchUserFunction(getValues('textInput'), token, setUsersList);
        });

        return () => {
            socket?.off("RequestValidation");
        }
    }, [])

    const endOfTyping = () => {
        if (getValues('textInput') && getValues('textInput').length > 0) {
            if (functionality !== SearchBarFunctionality.CHAN_INVITE)
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