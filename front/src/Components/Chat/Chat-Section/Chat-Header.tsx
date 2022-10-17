import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { IconSettings, IconMenu2, IconChevronLeft, IconChevronRight } from "@tabler/icons";

import { SidebarContext } from "../Chat";
import { UserInterface } from "../../../Types/User-Types";
import { Channel } from "../../../Types/Chat-Types"
import DropdownContainer from "../../Utils/Dropdown-Container";
import BlockButton from "../../Utils/Block-Button";

interface Props {
    chatItem?: Channel | undefined,
    privateConvUser?: UserInterface,
    showUsersSidebar?: boolean,
    changeSidebarStatus?: Function,
}

function ChatHeader(props: Props) {
    const { chatItem, privateConvUser, showUsersSidebar, changeSidebarStatus } = props;
    const [showDropdown, setShowDropdown] = useState<boolean>(false);

    const handleClick = () => {
        setShowDropdown(!showDropdown);
    }

    const sidebarStatus = useContext(SidebarContext);

    return (chatItem && changeSidebarStatus) ? (
        <div className="message-header">
            <IconMenu2
                className="burger-icon-responsive"
                onClick={() => sidebarStatus.setSidebarStatus()}
            />
            <p className="chan-name"> # {chatItem?.name} </p>
            <div className="message-header-right-side">
                <Link to={`/chat/channel/${chatItem?.id}/settings`} state={chatItem} >
                    <IconSettings />
                </Link>
                {showUsersSidebar === false && <IconChevronLeft onClick={() => changeSidebarStatus()} />}
                {showUsersSidebar && <IconChevronRight onClick={() => changeSidebarStatus()} />}
            </div>
        </div>
    ) : (
        <div className="header-user-info">
            <IconMenu2
                className="burger-icon-responsive"
                onClick={() => sidebarStatus.setSidebarStatus()}
            />
            <div className="player-container">
                <div className={`player-status player-status-online`}> </div>
                <p onClick={() => handleClick()}> {privateConvUser?.username} </p>
                <DropdownContainer show={showDropdown} onClickOutside={handleClick}>
                    <Link to={`/profile/${privateConvUser?.username}`}>
                        <p> profile </p>
                    </Link>
                    <BlockButton senderId={privateConvUser!.id} />
                </DropdownContainer>
            </div>
        </div>
    );
}

export default ChatHeader;