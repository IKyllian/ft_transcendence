import { useEffect, useState, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import { ChannelsDatas, ChannelsPublicDatas } from "../../../Interfaces/Datas-Examples";
import { ChannelsInterfaceFront } from "../../../Interfaces/Interface-Chat";
import SidebarItem from "./Sidebar-Item";
import { SidebarContext } from "../Chat";

function Sidebar(props: {showModal: number, setShowModal: Function}) {
    const {showModal, setShowModal} = props;
    const [chanDatas, setChanDatas] = useState<ChannelsInterfaceFront[] | undefined>(undefined);

    const sidebarStatus = useContext(SidebarContext);
    const ref = useRef<HTMLHeadingElement>(null);
    let params = useParams();

    useEffect(() => {
        const handleClickOutside = (event: any) => {
            if (ref.current && !ref.current.contains(event.target)) {
                sidebarStatus.sidebar && sidebarStatus.setSidebarStatus && sidebarStatus.setSidebarStatus();
            }
        };
        document.addEventListener('click', handleClickOutside, true);

        return () => {
            document.removeEventListener('click', handleClickOutside, true);
        };
    }, [sidebarStatus, sidebarStatus.setSidebarStatus]);

    useEffect(() => {
        if (ChannelsDatas.length > 0) {
            let datasArray: ChannelsInterfaceFront[] = [];
            for (let i: number = 0; i < ChannelsDatas.length; i++) {
                datasArray.push({
                    channel: ChannelsDatas[i],
                    isActive: "false",
                });
            }
            if (params) {
                let findOpenChat: ChannelsInterfaceFront | undefined = datasArray.find(elem => elem.channel.id === parseInt(params.chatId!, 10));
                if (findOpenChat) {
                    findOpenChat.isActive = "true";
                }
            }
            setChanDatas(datasArray);
        }
    }, [params])

    const chanClick = (id: number) => {
        if (chanDatas !== undefined) {
            let newArray: ChannelsInterfaceFront[] = [...chanDatas];
    
            let findActiveElem: ChannelsInterfaceFront | undefined =  newArray.find(elem => elem.isActive === "true");
            if (findActiveElem !== undefined) {
                findActiveElem.isActive = "false";
            }

            let elemById: ChannelsInterfaceFront | undefined = newArray.find((elem) => elem.channel.id  === id);
            if (elemById !== undefined) {
                elemById.isActive = "true";
            }
            setChanDatas(newArray);
        }
    }
 
    return (
        <div ref={ref} className={`chat-sidebar ${sidebarStatus.sidebar ? "chat-sidebar-responsive" : ""}`}>
            <ul className="ul-wrapper">
                <SidebarItem
                    index={0}
                    title="Channels"
                    datasArray={chanDatas === undefined ? undefined : chanDatas.filter((elem) => elem.channel.isChannel)}
                    setShowModal={setShowModal}
                    showModal={showModal}
                    chanClick={chanClick}
                />
                <SidebarItem
                    index={1}
                    title="Messages Privées"
                    datasArray={chanDatas === undefined ? undefined : chanDatas.filter((elem) => !elem.channel.isChannel)}
                    setShowModal={setShowModal}
                    showModal={showModal}
                    chanClick={chanClick}
                />
                <SidebarItem
                    index={2}
                    title="Public Channels"
                    publicChanArray={ChannelsPublicDatas}
                    setShowModal={setShowModal}
                    showModal={showModal}
                    chanClick={chanClick}
                />
            </ul>
        </div>
    );
}

export default Sidebar;