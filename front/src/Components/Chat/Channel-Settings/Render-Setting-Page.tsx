import ChannelUsers from "./Channel-Users";
import GlobalSettings from "./Global-Settings";
import ChannelBanUser from "./Channel-Ban-User";

function RenderSettingPage(props: {item: string,}) {
    const { item } = props;

    if (item === "Invitations") {
        return (
            <ChannelBanUser />
        );
    } else if (item === "Settings") {
        return (
            <GlobalSettings />
        );
    } else {
        return (
            <ChannelUsers />
        );
    }
}

export default RenderSettingPage;