import { useState, useContext, useEffect } from "react";
import { ModalContext } from "../../Components/Utils/ModalProvider";
import { ProfileState } from "../../Types/User-Types";
import { useAppSelector } from '../../Redux/Hooks';
import { useParams } from "react-router-dom";

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
    
    const params = useParams();
    const modalStatus = useContext(ModalContext);
    let {currentUser, token} = useAppSelector(state => state.auth);
    
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
        if (params.username === currentUser?.username) {
            setUserState({
                isLoggedUser: true,
                user: currentUser!,
            });
        }
        else if (params.username) {
            fetchProfile(params.username, token, setUserState);
        }
    }, [params])

    return {
        userState: userState,
        handleClick: handleClick,
        modalStatus: modalStatus,
        attributes: attributes
    }
}