import { ChannelsDatas } from "../../Interfaces/Datas-Examples";

import SidebarItem from "./Sidebar-Item";

function Sidebar(props: {setShowModal: Function, showModal: number}) {
    const {setShowModal, showModal} = props;
 
    return (
        <div className="chat-sidebar">
            <ul className="ul-wrapper">
                <SidebarItem
                    index={0}
                    title="Channels"
                    datasArray={ChannelsDatas.filter((elem) => "channelName" in elem)} // (Temporaire en attendant le Back) Sert pour l'instant à différencié le type ChannelsDatas et PrivateMessageDatas puisque tout est stocker dans le meme tableau
                    setShowModal={setShowModal}
                    showModal={showModal}
                />
                <SidebarItem
                    index={1}
                    title="Messages Privées"
                    datasArray={ChannelsDatas.filter((elem) => "user" in elem)} // (Temporaire en attendant le Back) Sert pour l'instant à différencié le type ChannelsDatas et PrivateMessageDatas puisque tout est stocker dans le meme tableau
                    setShowModal={setShowModal}
                    showModal={showModal}
                />
            </ul>
        </div>
    );
}

export default Sidebar;