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
                    <Link className="list-item-container" key={elem.channel.id} to={`/chat/channel/${elem.channel.id}`} onClick={() => sidebarStatus.setSidebarStatus()}>
                        <li is-target={elem.isActive}>
                            # {elem.channel.name}
                        </li>
                    </Link>
                )
            }
            {
                privateConvs && privateConvs.map((elem) => 
                    <Link className="list-item-container" key={elem.conversation.id} to={`/chat/private-message/${getSecondUserIdOfPM(elem.conversation, currentUser!.id)}`} onClick={() => sidebarStatus.setSidebarStatus()}>
                        <li is-target={elem.isActive}>
                            {elem.conversation.user1.id !== currentUser?.id ? elem.conversation.user1.username : elem.conversation.user2.username }
                        </li>
                    </Link>
                )
            }
        </ul>
    );
}

export default ItemContent;