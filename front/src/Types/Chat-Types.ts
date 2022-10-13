import { ChatInterface } from "./Datas-Examples";
import { UserInterface } from "./User-Types";

export interface ChannelsInterfaceFront {
    isActive: string,
    channel: Channel,
}

export interface ConversationInterfaceFront {
    isActive: string,
    conversation: Conversation,
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

export interface Conversation {
    id: number,
    user1: UserInterface,
    user2: UserInterface,
    messages: PrivateMessage[],
}

interface PrivateMessage {
    id: number,
    sender: UserInterface,
    content: string,
    send_at: string,
    // conversation: Conversation[],
}