import {ChannelInterface, PrivateMessageInterface} from "./Datas-Examples";

export interface ChannelsInterfaceFront {
    isActive: string,
    channel: ChannelInterface | PrivateMessageInterface,
}