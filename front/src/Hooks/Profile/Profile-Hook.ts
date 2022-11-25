import { useState, useContext, useEffect } from "react";
import { ModalContext } from "../../Components/Utils/ModalProvider";
import { ProfileState, UserInterface, UserStatus } from "../../Types/User-Types";
import { useAppSelector } from '../../Redux/Hooks';
import { useParams } from "react-router-dom";
import { SocketContext } from "../../App";
import { fetchProfile, fetchMe } from "../../Api/Profile/Profile-Fetch";
import { Modes } from "../../Types/Utils-Types";
import { AxiosResponse } from "axios";

interface ProfileMenuButtons {
    title: string;
    isActive: string;
}

export function useProfileHook() {
    const [attributes, setAttributes] = useState<ProfileMenuButtons[]>([
        { title: "Achievements", isActive: "true" },
        { title: "Matches", isActive: "false" },
        { title: "Friends", isActive: "false" }
    ]);
    const [userState, setUserState] = useState<ProfileState | undefined>(undefined);
    const [friendRequestSent, setFriendRequestSent] = useState<number>(0);
    const [statsMode, setStatsMode] = useState<Modes>(Modes.Singles); 

    const params = useParams();
    const modalStatus = useContext(ModalContext);
    let {currentUser, token, friendList} = useAppSelector(state => state.auth);
    let {notifications} = useAppSelector(state => state.notification);
    const {socket} = useContext(SocketContext);

    const handleClick = (index: number) => {
        let newArray = [...attributes];

        newArray.find(elem => {
            if (elem.isActive === "true")
                elem.isActive = "false"
       })
        newArray[index].isActive = "true";
        setAttributes(newArray);
    }

    const changeMode = (e: any) => {
        const mode: Modes = e.target.value;
        setStatsMode(mode);
    }

    useEffect(() => {
        handleClick(0);
        if (params.username && currentUser) {
            const promiseProfileFetch: Promise<AxiosResponse<any, any>> =  params.username === currentUser.username ? fetchMe(token) : fetchProfile(params.username, token, setUserState);
            promiseProfileFetch.then(fetchResponse => {
                if (fetchResponse) {
                    console.log("fetchResponse", fetchResponse);
                    setUserState({
                        isLoggedUser: params.username === currentUser!.username ? true : false,
                        user: {...fetchResponse.data.user},
                        match_history: fetchResponse.data.match_history,
                        friendList: friendList,
                        relationStatus: fetchResponse.data.relationStatus ? fetchResponse.data.relationStatus : undefined,
                    });
                }
            });
        }
    }, [params.username])

    useEffect(() => {
        if (params.username === currentUser?.username) {
            setUserState((prev: any) => { return {...prev, friendList: friendList}});
        }
    }, [friendList, notifications, friendRequestSent])

    useEffect(() => {
        socket?.on("RequestValidation", (() => {
            setFriendRequestSent(prev => {return prev + 1});
        }))

        socket?.on("StatusUpdate", (data: {id: number, status: UserStatus}) => {
            console.log("StatusUpdate", data);
            setUserState(prev => {
                if (prev && prev.user)
                    return {...prev, user: {...prev.user, status: data.status}};
                return prev;
            });
        });

        return () => {
            socket?.off("RequestValidation");
            socket?.off("StatusUpdate");
        }
    }, [socket])

    return {
        userState,
        handleClick,
        modalStatus,
        attributes,
        statsMode,
        changeMode,
    }
}