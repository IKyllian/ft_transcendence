import { ChannelsDatas, PrivateMessageDatas } from "../../Interfaces/Datas-Examples";

import SidebarItem from "./Sidebar-Item";

function Sidebar(props: {setShowChannelModal: Function, showModal: boolean, setChatItem: Function}) {
    const {setShowChannelModal, showModal, setChatItem} = props;
 
    return (
        <div className="chat-sidebar">
            <ul className="ul-wrapper">
                <SidebarItem
                    title="Channels"
                    datasArray={ChannelsDatas}
                    setShowChannelModal={setShowChannelModal}
                    showModal={showModal}
                    setChatItem={setChatItem}
                />
                <SidebarItem
                    title="Messages Privées"
                    datasArray={PrivateMessageDatas}
                    setShowChannelModal={setShowChannelModal}
                    showModal={showModal}
                    setChatItem={setChatItem}
                />
            </ul>
        </div>
    );
}

export default Sidebar;