import { useContext } from "react";
import { Link } from "react-router-dom";

import { ChannelsInterfaceFront, ConversationInterfaceFront } from "../../../Types/Chat-Types";
import { SidebarContext } from '../Chat';
import { useAppSelector } from '../../../Redux/Hooks'
import { getSecondUserIdOfPM } from "../../../Utils/Utils-Chat";

interface Props {
    chanDatas?: ChannelsInterfaceFront[],
    privateConvs?: ConversationInterfaceFront[],
}

function ItemContent(props: Props) {
    const {chanDatas, privateConvs} = props;
    const sidebarStatus = useContext(SidebarContext);

    let {currentUser} = useAppSelector((state) => state.auth);
    return (
        <ul className="ul-collapse">
            {
                chanDatas && chanDatas.map((elem) => 
                 <li key={elem.channel.id} className="list-item-container" >
                    <Link  is-target={elem.isActive} to={`/chat/channel/${elem.channel.id}`} onClick={() => sidebarStatus.setSidebarStatus()}>
                        # {elem.channel.name}
                    </Link>
                </li>
                )
            }
            {
                privateConvs && privateConvs.map((elem) => 
                    <li key={elem.conversation.id} className="list-item-container">
                        <Link is-target={elem.isActive} to={`/chat/private-message/${elem.conversation.id}`} onClick={() => sidebarStatus.setSidebarStatus()}>
                            {elem.conversation.user1.id !== currentUser?.id ? elem.conversation.user1.username : elem.conversation.user2.username }
                        </Link>
                    </li>
                )
            }
        </ul>
    );
}

export default ItemContent;