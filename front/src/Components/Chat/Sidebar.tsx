import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ChannelsDatas } from "../../Interfaces/Datas-Examples";
import { ChannelsInterfaceFront } from "../../Interfaces/Interface-Chat";
import SidebarItem from "./Sidebar-Item";

function Sidebar(props: {showModal: number, setShowModal: Function}) {
    const {showModal, setShowModal} = props;
    const [chanDatas, setChanDatas] = useState<ChannelsInterfaceFront[] | undefined>(undefined);

    let params = useParams();

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
        <div className="chat-sidebar">
            <ul className="ul-wrapper">
                <SidebarItem
                    index={0}
                    title="Channels"
                    datasArray={chanDatas === undefined ? undefined : chanDatas.filter((elem) => "channelName" in elem.channel)} // (Temporaire en attendant le Back) Sert pour l'instant à différencié le type ChannelInterface et PrivateMessageInterface puisque tout est stocker dans le meme tableau
                    setShowModal={setShowModal}
                    showModal={showModal}
                    chanClick={chanClick}
                />
                <SidebarItem
                    index={1}
                    title="Messages Privées"
                    datasArray={chanDatas === undefined ? undefined : chanDatas.filter((elem) => "user" in elem.channel)} // (Temporaire en attendant le Back) Sert pour l'instant à différencié le type ChannelInterface et PrivateMessageInterface puisque tout est stocker dans le meme tableau
                    setShowModal={setShowModal}
                    showModal={showModal}
                    chanClick={chanClick}
                />
            </ul>
        </div>
    );
}

export default Sidebar;