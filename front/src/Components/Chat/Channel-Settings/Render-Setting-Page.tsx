import ChannelUsers from "./Channel-Users";
import GlobalSettings from "./Global-Settings";
import { Channel } from "../../../Types/Chat-Types";
import ChannelBanUser from "./Channel-Ban-User";

interface State {
    item: string,
    channelDatas: Channel,
    loggedUserIsOwner: boolean,
    loggedUserToken: string,
    setChannelDatas: Function,
}

function RenderSettingPage(props: State) {
    const { item, channelDatas, loggedUserIsOwner, loggedUserToken, setChannelDatas } = props;

    if (item === "Invitations") {
        return (
            <ChannelBanUser chanId={channelDatas.id} usersBan={channelDatas.bannedUsers} loggedUserToken={loggedUserToken} setChannelDatas={setChannelDatas} />
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