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

    const modalStatus = () => {
            setShowModal!(index === 0 ? 1 : 0);
    }

    return (
        <li className="ul-wrapper-elem">
            <ItemHeader title={title} sidebarOpen={sidebarOpen} handleClick={handleClick} modalStatus={modalStatus} />           
            {
               chanDatas !== undefined && sidebarOpen && 
               <ItemContent chanDatas={chanDatas} />
            }
            {
                privateConvs !== undefined && sidebarOpen &&
                <ItemContent chanDatas={chanDatas} />
            }
        </li>
    );
}

export default SidebarItem;