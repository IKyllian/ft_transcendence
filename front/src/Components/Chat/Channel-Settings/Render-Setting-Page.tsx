import ChannelInvitations from "./Channel-Invitations";
import ChannelUsers from "./Channel-Users";
import GlobalSettings from "./Global-Settings";

function RenderSettingPage(props: {item: string}) {
    const { item } = props;

    if (item === "Invitations") {
        return (
            <ChannelInvitations />
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