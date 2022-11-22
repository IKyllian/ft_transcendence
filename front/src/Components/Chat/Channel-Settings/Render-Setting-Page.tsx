import ChannelUsers from "./Channel-Users";
import GlobalSettings from "./Global-Settings";
import { Channel, TimeoutType } from "../../../Types/Chat-Types";
import ChannelBanUser from "./Channel-Ban-User";

interface State {
    item: string,
    channelDatas: Channel,
    loggedUserIsOwner: boolean,
}

function RenderSettingPage(props: State) {
    const { item, channelDatas, loggedUserIsOwner } = props;

    if (item === "Invitations") {
        return (
            <ChannelBanUser
                chanId={channelDatas.id}
                usersBan={channelDatas.usersTimeout.filter(elem => elem.type === TimeoutType.BAN)}
            />
        );
    } else if (item === "Settings") {
        return (
            <GlobalSettings chanDatas={channelDatas} />
        );
    } else {
        return (
            <ChannelUsers users={channelDatas.channelUsers} loggedUserIsOwner={loggedUserIsOwner} />
        );
    }
}

export default RenderSettingPage;