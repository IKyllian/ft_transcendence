import { UserInterface } from "./User-Types";

export interface ChannelsInterfaceFront {
    isActive: string,
    channel: ChannelInfoSidebar,
}

export interface ConversationInterfaceFront {
    isActive: string,
    conversation: ConversationInfoSidebar,
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
    send_at: Date,
}

export interface Channel {
    id: number,
    name: string,
    option: string,
    channelUsers: ChannelUser[],
    messages: ChatMessage[],
}

export interface ChannelInfoSidebar {
    id: number,
    name: string,
    option: string,
}

export interface Conversation {
    id: number,
    user1: UserInterface,
    user2: UserInterface,
    messages: PrivateMessage[],
}

export interface ConversationInfoSidebar {
    id: number,
    user1: UserInterface,
    user2: UserInterface,
}

interface PrivateMessage {
    id: number,
    sender: UserInterface,
    content: string,
    send_at: Date,
}