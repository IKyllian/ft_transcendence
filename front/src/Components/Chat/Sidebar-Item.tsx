import { useState } from "react";

import { IconChevronDown, IconPlus, IconChevronRight } from "@tabler/icons";
import { ChannelInterface, PrivateMessageInterface } from "../../Interfaces/Datas-Examples"

import { Link } from "react-router-dom"

interface SidebarItemProps {
    index: number,
    title: string,
    datasArray: (ChannelInterface | PrivateMessageInterface)[],
    setShowModal: Function,
    showModal: number,
}

function SidebarItem(props: SidebarItemProps) {
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

    const {index, title, datasArray, setShowModal, showModal} = props;

    const handleClick = () => {
        if (sidebarOpen)
            setSidebarOpen(false);
        else
            setSidebarOpen(true);
    }

    const modalStatus = () => {
        if (showModal > 0)
            setShowModal(0);
        else
            setShowModal(index === 0 ? 1 : 2);
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
                                    <li key={index}>
                                        <Link to={`/chat/${elem.id}`}>
                                            # {elem.channelName}
                                        </Link>
                                    </li>
                                );
                            } else {
                                return (
                                    <li key={index}>
                                        <Link to={`/chat/${elem.id}`}>
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