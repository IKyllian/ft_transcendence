import { useState, useContext, useEffect } from "react";
import { ModalContext } from "../../Components/Utils/ModalProvider";
import { ProfileState } from "../../Types/User-Types";
import { useAppSelector } from '../../Redux/Hooks';
import { useParams } from "react-router-dom";

import { SocketContext } from "../../App";
import { fetchProfile } from "../../Api/Profile/Profile-Fetch";

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

    useEffect(() => {
        handleClick(0);
    }, [params.username])

    useEffect(() => {
        if (params.username === currentUser?.username) {
            setUserState({
                isLoggedUser: true,
                user: currentUser!,
                friendList: friendList,
            });
        }
        else if (params.username) {
            fetchProfile(params.username, token, setUserState);
        }

        
    }, [params, friendList, notifications, friendRequestSent])

    useEffect(() => {
        socket?.on("RequestValidation", (() => {
            setFriendRequestSent(prev => {return prev + 1});
        }))

        return () => {
            socket?.off("RequestValidation");
        }
    }, [])

    return {
        userState,
        handleClick,
        modalStatus,
        attributes,
    }
}