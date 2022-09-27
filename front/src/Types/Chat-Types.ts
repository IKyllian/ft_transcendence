import { ChatInterface } from "./Datas-Examples";
import { UserInterface } from "./User-Types";

export interface ChannelsInterfaceFront {
    isActive: string,
    channel: Channel,
}

export interface ChannelUser {
    role: string,
    user: UserInterface,
    mutedTime?: string,
    is_muted: boolean, 
}

export interface ChatMessage {
    id: number,
    sender: UserInterface,
    content: string,
    send_at: string,
}

export interface Channel {
    id: number,
    name: string,
    option: string,
    nb: number,
    channelUsers: ChannelUser[],
    messages: ChatMessage[],
}