import { useState, useContext, createContext, useEffect } from "react";

import Sidebar from "./Sidebar/Sidebar";
import ChatModal from "./Chat-Modal";
import { Outlet, useParams } from "react-router-dom";
import { ModalContext } from "../Utils/ModalProvider";
import { Channel, ChannelsInterfaceFront } from "../../Types/Chat-Types";
import LoadingSpin from "../Utils/Loading-Spin";
import axios from "axios";
import { baseUrl } from "../../env";
import { useAppSelector } from '../../Redux/Hooks'

export const SidebarContext = createContext({sidebar: false, setSidebarStatus: () => {}});

function Chat() {
    const [showModal, setShowModal] = useState<number>(0);
    const [responsiveSidebar, setReponsiveSidebar] = useState<boolean>(false);
    const [channelsDatas, setChannelsDatas] = useState<ChannelsInterfaceFront[] | undefined>(undefined);

    let authDatas = useAppSelector((state) => state.auth);
    const params = useParams();
    const modalStatus = useContext(ModalContext);

    const handleClick = () => {
        setReponsiveSidebar(!responsiveSidebar);
    }

    useEffect(() => {
        if (params.chatId === undefined) {
            setReponsiveSidebar(true);
        }

        if (channelsDatas && channelsDatas.length > 0) {
            let datasArray: ChannelsInterfaceFront[] = [];
            for (let i: number = 0; i < channelsDatas.length; i++) {
                datasArray.push({
                    channel: channelsDatas[i].channel,
                    isActive: "false",
                });
            }
            if (params) {
                let findOpenChat: ChannelsInterfaceFront | undefined = datasArray.find(elem => elem.channel.id === parseInt(params.chatId!, 10));
                if (findOpenChat) {
                    findOpenChat.isActive = "true";
                }
            }
            setChannelsDatas(datasArray);
        }
    }, [params])

    useEffect(() => {
        
    }, [params])

    useEffect(() => {
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
            setChannelsDatas(datasArray);
        }).catch(err => {
            console.log(err);
        })
    }, [])

    const chanClick = (id: number) => {
        if (channelsDatas !== undefined) {
            let newArray: ChannelsInterfaceFront[] = [...channelsDatas];
    
            let findActiveElem: ChannelsInterfaceFront | undefined =  newArray.find(elem => elem.isActive === "true");
            if (findActiveElem !== undefined) {
                findActiveElem.isActive = "false";
            }

            let elemById: ChannelsInterfaceFront | undefined = newArray.find((elem) => elem.channel.id  === id);
            if (elemById !== undefined) {
                elemById.isActive = "true";
            }
            setChannelsDatas(newArray);
        }
    }

    return !channelsDatas ? (
        <LoadingSpin classContainer="chat-page-container" />
    ) : (
        <SidebarContext.Provider value={{sidebar: responsiveSidebar, setSidebarStatus: handleClick}}>
            <ChatModal showModal={showModal} setShowModal={setShowModal} setChannelsDatas={setChannelsDatas}  />
            <div className={`chat-page-container ${modalStatus.modal.isOpen ? modalStatus.modal.blurClass : ""}`}>
                <Sidebar setShowModal={setShowModal} showModal={showModal} chanDatas={channelsDatas} chanClick={chanClick} />
                {
                    params.chatId === undefined
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
    // return (
    //     <SidebarContext.Provider value={{sidebar: responsiveSidebar, setSidebarStatus: handleClick}}>
    //         <ChatModal showModal={showModal} setShowModal={setShowModal}  />
    //         <div className={`chat-page-container ${modalStatus.modal.isOpen ? modalStatus.modal.blurClass : ""}`}>
    //             <Sidebar setShowModal={setShowModal} showModal={showModal} />
    //             {
    //                 params.chatId === undefined
    //                 ? 
    //                 <div className="no-target-message">
    //                     <p> Sélectionnez un message ou un channel </p>
    //                 </div> 
    //                 :
    //                 <Outlet />
    //             }
    //         </div>
    //     </SidebarContext.Provider>
    // );
}

export default Chat;