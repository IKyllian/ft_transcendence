import { UserInterface } from "./User-Types";

export interface ChannelsInterfaceFront {
    isActive: string,
    channel: ChannelInfoSidebar,
}

export interface ConversationInterfaceFront {
    isActive: string,
    conversation: ConversationInfoSidebar,
}

export enum TimeoutType {
    BAN,
    MUTED
}

export enum ChannelUpdateType {
    JOIN,
    LEAVE,
    BAN,
    MUTE,
    UNTIMEOUT,
    CHANUSER,
}

export enum ChannelModes {
    PUBLIC,
    PRIVATE,
    PROTECTED,
}

export const ChannelModesArray: string[] = [
    "public",
    "private",
    "protected"
]

export interface CreateChanBodyRequest {
    name: string,
    option: ChannelModes,
    password?: string,
}

export interface PreviousMessagesState {
    loadPreviousMessages: boolean,
    reachedMax: boolean,
}

export interface ChannelUser {
    id: number,
    role: string,
    user: UserInterface,
    mutedTime?: string,
    is_muted: boolean, 
    channelId: number,
}

export interface UserTimeout {
    id: number,
    user: UserInterface,
    until?: number,
    channel: Channel,
    type: TimeoutType,
}

export interface ChatMessage {
    id: number,
    sender?: UserInterface,
    content: string,
    send_at: string,
    channel: Channel,
}

export interface Channel {
    id: number,
    name: string,
    option: ChannelModes,
    channelUsers: ChannelUser[],
    messages: ChatMessage[],
    usersTimeout: UserTimeout[],
}

export interface ChannelInfoSidebar {
    id: number,
    name: string,
    option: ChannelModes,
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

export interface PrivateMessage {
    id: number,
    sender: UserInterface,
    content: string,
    send_at: string,
    conversation: Conversation;
}

export interface ConversationState {
    temporary: boolean,
    conv: Conversation
}

export const defaultMessagesState: PreviousMessagesState = {
    loadPreviousMessages: false,
    reachedMax: false
}