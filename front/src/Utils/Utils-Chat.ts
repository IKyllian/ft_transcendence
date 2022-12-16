import { ChannelModes, Conversation, ConversationInfoSidebar, TimeoutType, UserTimeout } from "../Types/Chat-Types";
import { UserInterface } from "../Types/User-Types";

export function getSecondUserIdOfPM(conversation: Conversation | ConversationInfoSidebar, userConnectedId: number): number {
    return conversation.user1.id !== userConnectedId ? conversation.user1.id : conversation.user2.id;
}

export function getSecondUserOfPM(conversation: Conversation | ConversationInfoSidebar, userConnectedId: number): UserInterface {
    return conversation.user1.id !== userConnectedId ? conversation?.user1 : conversation.user2;
}

export function getSecondUsernameOfPM(conversation: Conversation, userConnectedId: number): string {
    return conversation.user1.id !== userConnectedId ? conversation.user1.username : conversation.user2.username;
}

export function getMessageDateString(date: string): string {
    const currentDate = new Date();
    const dateMessage = new Date(date);

    if (currentDate.getFullYear() === dateMessage.getFullYear()
        && currentDate.getMonth() === dateMessage.getMonth()
        && currentDate.getDate() === dateMessage.getDate())
        return (`Aujourd'hui à ${dateMessage.getHours()}:${dateMessage.getMinutes() >= 0 && dateMessage.getMinutes() <= 9 ? '0' : ''}${dateMessage.getMinutes()}`);
    else if (currentDate.getFullYear() === dateMessage.getFullYear()
        && currentDate.getMonth() === dateMessage.getMonth()
        && (currentDate.getDate() - 1) === dateMessage.getDate())
        return (`Hier à ${dateMessage.getHours()}:${dateMessage.getMinutes() >= 0 && dateMessage.getMinutes() <= 9 ? '0' : ''}${dateMessage.getMinutes()}`);
    else
        return (`${dateMessage.getDate()}/${dateMessage.getMonth()}/${dateMessage.getFullYear()}`);
}

export function getMessageHour(date: string): string {
    const dateMessage = new Date(date);
    return (`${dateMessage.getHours()}:${dateMessage.getMinutes() >= 0 && dateMessage.getMinutes() <= 9 ? '0' : ''}${dateMessage.getMinutes()}`)
}

export function UserIsMute(usersTimeout: UserTimeout[], userId: number): boolean {
    return usersTimeout.find(elem => (elem.user.id === userId && elem.type === TimeoutType.MUTED)) ? true : false;
}

export const selectChanMode = (modeString: string): ChannelModes => {
    if (modeString === "public")
        return ChannelModes.PUBLIC;
    else if (modeString === "protected")
        return ChannelModes.PROTECTED;
    return ChannelModes.PRIVATE;
}

export const ChanModeToString = (mode: ChannelModes): string => {
    if (mode === ChannelModes.PUBLIC)
        return "public" ;
    else if (mode === ChannelModes.PROTECTED)
        return "protected";
    return "private";
}

export const debounce = (func: Function, debouneTime: number) => {
    let timer: any;
    return function (...args: any) {
        const context: any = debounce;
        if (timer)
            clearTimeout(timer);
        timer = setTimeout(() => {
            timer = null;
            func.apply(context, args);
        }, debouneTime);
    };
};

export function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window;
    return {
        width,
        height
    };
}