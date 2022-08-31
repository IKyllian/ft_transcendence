import { ChannelsDatas, PrivateMessageDatas } from "../../Interfaces/Datas-Examples";

import SidebarItem from "./Sidebar-Item";

function Sidebar(props: {setShowModal: Function, showModal: number, setChatItem: Function}) {
    const {setShowModal, showModal, setChatItem} = props;
 
    return (
        <div className="chat-sidebar">
            <ul className="ul-wrapper">
                <SidebarItem
                    index={0}
                    title="Channels"
                    datasArray={ChannelsDatas}
                    setShowModal={setShowModal}
                    showModal={showModal}
                    setChatItem={setChatItem}
                />
                <SidebarItem
                    index={1}
                    title="Messages Privées"
                    datasArray={PrivateMessageDatas}
                    setShowModal={setShowModal}
                    showModal={showModal}
                    setChatItem={setChatItem}
                />
            </ul>
        </div>
    );
}

export default Sidebar;