import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../Redux/Hooks";
import { changeActiveElement } from "../../Redux/ChatSlice";
import { useEffect, useState, useCallback, useContext } from "react";
import { fetchUserChannels, fetchUserConvs, fetchConvAndRedirect } from "../../Api/Chat/Chat-Fetch";
import { SocketContext } from "../../App";
import { ModalContext } from "../../Components/Utils/ModalProvider";
import { ConversationInterfaceFront, ChannelsInterfaceFront } from "../../Types/Chat-Types";
import { copyChannelsAndConvs } from "../../Redux/ChatSlice";

export function useLoadChatDatas() {
    //States
    const [showModal, setShowModal] = useState<number>(0);
    const [responsiveSidebar, setReponsiveSidebar] = useState<boolean>(false);

    // Appels aux hooks
    const authDatas = useAppSelector((state) => state.auth);
    const chatDatas = useAppSelector((state) => state.chat);
    const params = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const {socket} = useContext(SocketContext);
    const modalStatus = useContext(ModalContext);
    
    const channelId: number | undefined = params.channelId ? parseInt(params.channelId!, 10) : undefined;
    const convId: number | undefined = params.convId ? parseInt(params.convId!, 10) : undefined;

    console.log("Chat render");

    const sidebarOnChange = () => {
        setReponsiveSidebar(!responsiveSidebar);
    };

    const onCloseModal = useCallback(() => {
        setShowModal(0);
    }, [setShowModal]);

    const changeModalStatus = useCallback((index: number) => {
        setShowModal(index);
    }, [setShowModal]);

    // Les useEffect pour les call api etc..
    useEffect(() => {
        if (showModal !== 0)
            onCloseModal();
        // Permet d'afficher la sidebar si aucun channel ou aucune conv n'est selectionner (en responsive)
        if ((channelId === undefined && convId === undefined) && window.innerWidth <= 855 && location.pathname !== "/chat/channels-list")
            setReponsiveSidebar(true);
        // Permet de mettre en couleur le channel ou la conv selectionner
        if (channelId) {
            console.log("changeActiveElement");
            dispatch(changeActiveElement({id:channelId, isChannel: true}));
        } else if (convId)
            dispatch(changeActiveElement({id:convId, isChannel: false}));
    }, [channelId, convId, location.pathname, window.innerWidth])

    useEffect(() => {

        const resolvePromises =  async (channelsUser: Promise<ChannelsInterfaceFront[]>, convsUser: Promise<ConversationInterfaceFront[]>) => {
            const channelResolve: ChannelsInterfaceFront[] = await channelsUser.then(result => { return result });
            const convResolve: ConversationInterfaceFront[] = await convsUser.then(result => { return result });
            dispatch(copyChannelsAndConvs({channels: channelResolve, convs: convResolve}));
        }
        console.log("UseEffect Fetch");
        const channelsUser = fetchUserChannels(authDatas.token, channelId, dispatch); //Recupere les channels d'un user
        const convsUser = fetchUserConvs(authDatas.token, dispatch); //Recupere les convs d'un user
        resolvePromises(channelsUser, convsUser);


        //Permet de redirect sur une conv (et de la créer si besoin) dans le cas où un user click quelque part pour dm quelqu'un
        if (location && location.state) {
            const locationState = location.state as {userIdToSend: number};
            fetchConvAndRedirect(
                authDatas.currentUser!,
                locationState.userIdToSend,
                authDatas.token,
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
        showModal: showModal,
        responsiveSidebar: responsiveSidebar,
        sidebarOnChange: sidebarOnChange,
        onCloseModal: onCloseModal,
        changeModalStatus: changeModalStatus,
        paramsChannelId: channelId,
        locationPathname: location.pathname,
        modalStatus: modalStatus,
    }    
}