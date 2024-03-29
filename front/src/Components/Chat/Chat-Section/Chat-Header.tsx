import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { IconSettings, IconMenu2, IconChevronLeft, IconChevronRight, IconUserPlus } from "@tabler/icons";
import { SidebarContext } from "../Chat";
import { UserInterface, UserStatus } from "../../../Types/User-Types";
import { Channel } from "../../../Types/Chat-Types"
import DropdownContainer from "../../Utils/Dropdown-Container";
import BlockButton from "../../Buttons/Block-Button";
import { SetModalContext } from "../Chat";
import { useAppDispatch } from "../../../Redux/Hooks";
import { closeSidebarChatStatus } from "../../../Redux/PartySlice";
import SpectateButton from "../../Buttons/Spectate-Button";

interface Props {
    chatItem?: Channel | undefined,
    privateConvUser?: UserInterface,
    showUsersSidebar?: boolean,
    changeSidebarStatus?: Function,
    isPartyChat?: boolean,
}

function ChatHeader(props: Props) {
    const { chatItem, privateConvUser, showUsersSidebar, changeSidebarStatus, isPartyChat } = props;
    const [showDropdown, setShowDropdown] = useState<boolean>(false);
    const dispatch = useAppDispatch();

    const handleClick = () => {
        setShowDropdown(!showDropdown);
    }

    const sidebarStatus = useContext(SidebarContext);
    const modalStatus = useContext(SetModalContext);

    if (isPartyChat) {
        return (
            <div className="header-user-info">
                <IconChevronRight className="close-party-chat" onClick={() => dispatch(closeSidebarChatStatus())} />
                <p className="p-party-chat"> Party Chat </p>
            </div>
        );
    }

    return (chatItem && changeSidebarStatus) ? (
        <div className="message-header">
            <IconMenu2
                className="burger-icon-responsive"
                onClick={() => sidebarStatus.setSidebarStatus()}
            />
            <p className="chan-name"> # {chatItem?.name} </p>
            <div className="message-header-right-side">
                <div className="chat-action-icones">
                    <div className="tooltip-icon-wrapper" data-tooltips="Invite">
                        <IconUserPlus onClick={() => modalStatus.setModalStatus(3)} />
                    </div>
                    <Link className="tooltip-icon-wrapper" data-tooltips="Settings" to={`/chat/channel/${chatItem?.id}/settings`} state={chatItem} >
                        <IconSettings />
                    </Link> 
                </div>
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
                <div className={`player-status player-status-${privateConvUser?.status === UserStatus.ONLINE ? "online" : "offline"}`}> </div>
                <p onClick={() => handleClick()}> {privateConvUser?.username} </p>
                {privateConvUser &&  <SpectateButton in_game_id={privateConvUser.in_game_id} className='spectate-icon' />}               
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