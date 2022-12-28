import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../Redux/Hooks";
import { changeActiveElement, resetActiveElement } from "../../Redux/ChatSlice";
import { useEffect, useState, useCallback, useContext } from "react";
import { fetchUserChannels, fetchUserConvs, fetchConvAndRedirect } from "../../Api/Chat/Chat-Fetch";
import { SocketContext } from "../../App";
import { ModalContext } from "../../Components/Utils/ModalProvider";
import { ConversationInterfaceFront, ChannelsInterfaceFront } from "../../Types/Chat-Types";
import { copyChannelsAndConvs } from "../../Redux/ChatSlice";
import { setChannelId, unsetChannelDatas, unsetChannelId, updateChannelUserStatus } from "../../Redux/ChannelSlice";
import { getWindowDimensions } from "../../Utils/Utils-Chat";

export function useLoadChatDatas() {
    const [showModal, setShowModal] = useState<number>(0);
    const [responsiveSidebar, setReponsiveSidebar] = useState<boolean>(true);

    const authDatas = useAppSelector((state) => state.auth);
    const chatDatas = useAppSelector((state) => state.chat);
    const {currentChannelId} = useAppSelector((state) => state.channel);
    const params = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const {socket} = useContext(SocketContext);
    const modalStatus = useContext(ModalContext);

    const channelId: number | undefined = params.channelId ? +params.channelId! : undefined;
    const convId: number | undefined = params.convId ? +params.convId! : undefined;

    const sidebarOnChange = () => {
        setReponsiveSidebar(!responsiveSidebar);
    };

    const onCloseModal = useCallback(() => {
        setShowModal(0);
    }, [setShowModal]);

    const changeModalStatus = useCallback((index: number) => {
        setShowModal(index);
    }, [setShowModal]);

    useEffect(() => {
        if (socket && currentChannelId === undefined && channelId !== undefined) {
            socket.on("StatusUpdate", (data) => {
                dispatch(updateChannelUserStatus(data));
            });
        }
        if (socket && currentChannelId !== channelId) {
            if (currentChannelId !== undefined && location.pathname.includes("/chat")) {
                socket?.emit("LeaveChannelRoom", {
                    id: currentChannelId,
                });
                socket?.off("roomData");
                socket?.off("ChannelUpdate");
                dispatch(unsetChannelDatas());
                dispatch(unsetChannelId());
            }
            if (channelId !== undefined)
                dispatch(setChannelId(channelId));
            else
                dispatch(unsetChannelId());
        }
    }, [channelId, location.pathname, socket]);

    useEffect(() => {
        function handleResize() {
            const width = getWindowDimensions().width;
            if ((channelId === undefined && convId === undefined) && width <= 855 && location.pathname !== "/chat/channels-list" && !responsiveSidebar)
                setReponsiveSidebar(true);
            else if ((channelId !== undefined || convId !== undefined) && width <= 855 && responsiveSidebar)
                setReponsiveSidebar(false);
        }
        window.addEventListener('resize', handleResize);

        if (showModal !== 0)
            onCloseModal();
        if (!channelId && !convId && !responsiveSidebar)
            setReponsiveSidebar(true);
        // Permet de mettre en couleur le channel ou la conv selectionner
        if (channelId) {
            dispatch(changeActiveElement({id:channelId, isChannel: true}));
        } else if (convId)
            dispatch(changeActiveElement({id:convId, isChannel: false}));
        else if (!channelId && !convId)
            dispatch(resetActiveElement());
        return () => window.removeEventListener('resize', handleResize);
    }, [channelId, convId, location.pathname])

    useEffect(() => {
        if (channelId !== undefined || convId !== undefined)
            setReponsiveSidebar(false);

        const resolvePromises =  async (channelsUser: Promise<ChannelsInterfaceFront[]>, convsUser: Promise<ConversationInterfaceFront[]>) => {
            const channelResolve: ChannelsInterfaceFront[] = await channelsUser.then(result => { return result });
            const convResolve: ConversationInterfaceFront[] = await convsUser.then(result => { return result });
            dispatch(copyChannelsAndConvs({channels: channelResolve, convs: convResolve}));
        }
        const channelsUser = fetchUserChannels(channelId); //Recupere les channels d'un user
        const convsUser = fetchUserConvs(convId); //Recupere les convs d'un user
        resolvePromises(channelsUser, convsUser);

        //Permet de redirect sur une conv (et de la créer si besoin) dans le cas où un user click quelque part pour dm quelqu'un
        if (location && location.state) {
            const locationState = location.state as {userIdToSend: number};
            fetchConvAndRedirect(
                authDatas.currentUser!,
                locationState.userIdToSend,
                chatDatas.privateConv!,
                dispatch,
                navigate
            );
        }
    }, [])

    // Return tout ce que j'ai besoin pour le composant
    return {
        channels: chatDatas.channels,
        privateConvs: chatDatas.privateConv,
        showModal,
        responsiveSidebar,
        sidebarOnChange,
        onCloseModal,
        changeModalStatus,
        paramsChannelId: channelId,
        locationPathname: location.pathname,
        modalStatus,
    }    
}