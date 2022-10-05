import { useState, useContext, createContext, useEffect } from "react";

import Sidebar from "./Sidebar/Sidebar";
import ChatModal from "./Chat-Modal";
import { Outlet, useLocation, useParams } from "react-router-dom";
import { ModalContext } from "../Utils/ModalProvider";
import { Channel, ChannelsInterfaceFront } from "../../Types/Chat-Types";
import LoadingSpin from "../Utils/Loading-Spin";
import axios from "axios";
import { baseUrl } from "../../env";
import { useAppSelector, useAppDispatch } from '../../Redux/Hooks'
import { loadingDatas, copyChannelsArray } from "../../Redux/ChatSlice"

export const SidebarContext = createContext({sidebar: false, setSidebarStatus: () => {}});

function Chat() {
    const [showModal, setShowModal] = useState<number>(0);
    const [responsiveSidebar, setReponsiveSidebar] = useState<boolean>(false);
    // const [channelsDatas, setChannelsDatas] = useState<ChannelsInterfaceFront[] | undefined>(undefined);

    let authDatas = useAppSelector((state) => state.auth);
    let chatDatas = useAppSelector((state) => state.chat);
    const dispatch = useAppDispatch();
    const params = useParams();
    const location = useLocation();
    const modalStatus = useContext(ModalContext);

    const handleClick = () => {
        setReponsiveSidebar(!responsiveSidebar);
    }

    useEffect(() => {
        if (params.chatId === undefined) {
            setReponsiveSidebar(true);
        }

        if (chatDatas.channels && chatDatas.channels.length > 0) {
            let datasArray: ChannelsInterfaceFront[] = [];
            for (let i: number = 0; i < chatDatas.channels.length; i++) {
                datasArray.push({
                    channel: chatDatas.channels[i].channel,
                    isActive: "false",
                });
            }
            if (params) {
                let findOpenChat: ChannelsInterfaceFront | undefined = datasArray.find(elem => elem.channel.id === parseInt(params.chatId!, 10));
                if (findOpenChat) {
                    findOpenChat.isActive = "true";
                }
            }
            dispatch(copyChannelsArray(datasArray));
            // setChannelsDatas(datasArray);
        }
    }, [params])

    useEffect(() => {
        dispatch(loadingDatas());
        axios.get(`${baseUrl}/channel/my_channels`, {
            headers: {
                "Authorization": `Bearer ${authDatas.token}`,
            }
        })
        .then((response) => {
            const channelArray: Channel[] = response.data;

            let datasArray: ChannelsInterfaceFront[] = [];
            for (let i: number = 0; i < channelArray.length; i++) {
                datasArray.push({
                    channel: channelArray[i],
                    isActive: "false",
                });
            }
            if (params) {
                let findOpenChat: ChannelsInterfaceFront | undefined = datasArray.find(elem => elem.channel.id === parseInt(params.chatId!, 10));
                if (findOpenChat) {
                    findOpenChat.isActive = "true";
                }
            }
            dispatch(copyChannelsArray(datasArray));
            // setChannelsDatas(datasArray);
        }).catch(err => {
            console.log(err);
        })
    }, [])

    const chanClick = (id: number) => {
        if (chatDatas.channels !== undefined) {
            let newArray: ChannelsInterfaceFront[] = [...chatDatas.channels];
    
            let findActiveElem: ChannelsInterfaceFront | undefined =  newArray.find(elem => elem.isActive === "true");
            if (findActiveElem !== undefined) {
                findActiveElem.isActive = "false";
            }

            let elemById: ChannelsInterfaceFront | undefined = newArray.find((elem) => elem.channel.id  === id);
            if (elemById !== undefined) {
                elemById.isActive = "true";
            }
            dispatch(copyChannelsArray(newArray));
            // setChannelsDatas(newArray);
        }
    }

    return !chatDatas.channels ? (
        <LoadingSpin classContainer="chat-page-container" />
    ) : (
        <SidebarContext.Provider value={{sidebar: responsiveSidebar, setSidebarStatus: handleClick}}>
            <ChatModal showModal={showModal} setShowModal={setShowModal}  />
            <div className={`chat-page-container ${modalStatus.modal.isOpen ? modalStatus.modal.blurClass : ""}`}>
                <Sidebar setShowModal={setShowModal} showModal={showModal} chanDatas={chatDatas.channels} chanClick={chanClick} />
                {
                    params.chatId === undefined && location.pathname === "/chat"
                    ?
                    <div className="no-target-message">
                        <p> Sélectionnez un message ou un channel </p>
                    </div> 
                    :
                    <Outlet />
                }
            </div>
        </SidebarContext.Provider>
    )
}

export default Chat;