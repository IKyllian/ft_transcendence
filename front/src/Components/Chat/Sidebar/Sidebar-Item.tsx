import { useState } from "react";

import { ChannelsInterfaceFront, ConversationInterfaceFront } from "../../../Types/Chat-Types";
import ItemHeader from "./Item-Header";
import ItemContent from "./Item-Content";

interface SidebarItemProps {
    index: number,
    title: string,
    chanDatas?: ChannelsInterfaceFront[],
    privateConvs?: ConversationInterfaceFront[],
    setShowModal?: Function,
}

function SidebarItem(props: SidebarItemProps) {
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
    const {index, title, chanDatas, setShowModal, privateConvs} = props;

    const handleClick = () => {
        setSidebarOpen(!sidebarOpen);
    }

    return (
        <li className="ul-wrapper-elem">
            <ItemHeader title={title} sidebarOpen={sidebarOpen} handleClick={handleClick} modalStatus={() => setShowModal!(index)} />           
            {
               chanDatas !== undefined && sidebarOpen && 
               <ItemContent chanDatas={chanDatas} />
            }
            {
                privateConvs !== undefined && sidebarOpen &&
                <ItemContent privateConvs={privateConvs} />
            }
        </li>
    );
}

export default SidebarItem;