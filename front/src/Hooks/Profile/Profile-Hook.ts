import { useState, useContext, useEffect } from "react";
import { ModalContext } from "../../Components/Utils/ModalProvider";
import { ProfileState, UserStatus } from "../../Types/User-Types";
import { useAppDispatch, useAppSelector } from '../../Redux/Hooks';
import { useNavigate, useParams } from "react-router-dom";
import { SocketContext } from "../../App";
import { fetchProfile, fetchMe } from "../../Api/Profile/Profile-Fetch";
import { Modes } from "../../Types/Utils-Types";
import { AxiosResponse } from "axios";
import { PlayersGameData } from "../../Components/Game/game/types/shared.types";
import { newGameFound } from "../../Redux/PartySlice";

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
    const [statsMode, setStatsMode] = useState<Modes>(Modes.Singles); 

    let { currentUser, token, friendList } = useAppSelector(state => state.auth);
    const params = useParams();
    const modalStatus = useContext(ModalContext);
    const { socket } = useContext(SocketContext);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

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
        setUserState(undefined);
        if (params.username && currentUser) {
            const isLoggedUser: boolean = params.username === currentUser.username ? true : false;
            const promiseProfileFetch: Promise<AxiosResponse<any, any>> = isLoggedUser ? fetchMe(token) : fetchProfile(params.username, token);
            promiseProfileFetch.then(fetchResponse => {
                if (fetchResponse) {
                    console.log("fetchResponse", fetchResponse);
                    setUserState({
                        isLoggedUser: isLoggedUser ? true : false,
                        user: {...fetchResponse.data.user},
                        match_history: fetchResponse.data.match_history,
                        friendList: isLoggedUser ? friendList : fetchResponse.data.friendList,
                        relationStatus: fetchResponse.data.relationStatus ? fetchResponse.data.relationStatus : undefined,
                    });
                }
            })
            .catch((err) => {
                console.log(err);
                navigate("*");
            })
        }
    }, [params.username])

    useEffect(() => {
        if (params.username === currentUser?.username) {
            setUserState((prev: ProfileState | undefined) => { return prev ? {...prev, friendList: friendList} : prev});
        }
    }, [friendList])

    useEffect(() => {
        socket?.on('user_gameinfo', (data: PlayersGameData | null) => {
            if (data !== null) {
				dispatch(newGameFound({gameDatas: data, showGameFound: false}));
                navigate("/game", {state: data});
            }
        })

        socket?.on("RelationUpdate", (data: {id: number, relation: string}) => {
            setUserState((prev: ProfileState | undefined) => {
                return prev && data.id === prev.user.id ? {
                    ...prev,
                    relationStatus: data.relation
                } : prev});
        });

        socket?.on("InGameStatusUpdate", (data: {id: number, in_game_id: string | null}) => {
            setUserState(prev => {
                if (prev && prev.user)
                    return {...prev, user: {...prev.user, in_game_id: data.in_game_id}};
                return prev;
            });
        });

        socket?.on("StatusUpdate", (data: {id: number, status: UserStatus}) => {
            console.log("StatusUpdate", data);
            setUserState(prev => {
                if (prev && prev.user)
                    return {...prev, user: {...prev.user, status: data.status}};
                return prev;
            });
        });

        return () => {
            socket?.off("RelationUpdate");
            socket?.off("InGameStatusUpdate");
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