import { useState } from "react";

import {IconChevronDown, IconPlus, IconChevronRight} from "@tabler/icons";
import { ChannelInterface, PrivateMessageInterface } from "../../Interfaces/Datas-Examples"

import { Link } from "react-router-dom"

interface SidebarItemProps {
    title: string,
    datasArray: ChannelInterface[] | PrivateMessageInterface[],
    setShowChannelModal: Function,
    showModal: boolean,
    setChatItem: Function,
}

function SidebarItem(props: SidebarItemProps) {
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

    const {title, datasArray, setShowChannelModal, showModal, setChatItem} = props;

    const handleClick = () => {
        if (sidebarOpen)
            setSidebarOpen(false);
        else
            setSidebarOpen(true);
    }

    const modalStatus = () => {
        if (showModal)
            setShowChannelModal(false);
        else
            setShowChannelModal(true);
    }

    return (
        <li className="ul-wrapper-elem">
            <div className="collapse-button">
                <div className="collapse-button-name">
                    {
                        sidebarOpen ? <IconChevronDown onClick={handleClick} /> : <IconChevronRight onClick={handleClick} />
                    }
                    <p> {title} </p>
                </div>
                <IconPlus className="plus-icon" onClick={modalStatus} />
            </div>
            {
               sidebarOpen && 
               <ul className="ul-collapse">
                    {
                        datasArray.map((elem, index) => {
                            if ("channelName" in elem) {
                                return (
                                    <li key={index} onClick={() => setChatItem(elem)}>
                                        <Link to={`/chat/${index}`}>
                                            # {elem.channelName}
                                        </Link>
                                    </li>
                                );
                            } else {
                                return (
                                    <li key={index} onClick={() => setChatItem(elem)}>
                                        <Link to={`/chat/${index}`}>
                                            {elem.user.name}
                                        </Link>
                                    </li>
                                );
                            }
                        })
                    }
                </ul>
            } 
        </li>
    );
}

export default SidebarItem;