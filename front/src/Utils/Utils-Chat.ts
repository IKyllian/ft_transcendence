import { Conversation, ConversationInfoSidebar, ChannelUser } from "../Types/Chat-Types";
import { UserInterface } from "../Types/User-Types";

export function getSecondUserIdOfPM(conversation: Conversation | ConversationInfoSidebar, userConnectedId: number): number {
    return conversation?.user1.id !== userConnectedId ? conversation?.user1.id : conversation?.user2.id;
}

export function getSecondUserOfPM(conversation: Conversation | ConversationInfoSidebar, userConnectedId: number): UserInterface {
    return conversation?.user1.id !== userConnectedId ? conversation?.user1 : conversation?.user2;
}

export function getSecondUsernameOfPM(conversation: Conversation, userConnectedId: number): string {
    return conversation?.user1.id !== userConnectedId ? conversation?.user1.username : conversation?.user2.username;
}

export function getMessageDateString(date: Date): string {
    const currentDate = new Date();

    if (currentDate.getFullYear() === date.getFullYear()
        && currentDate.getMonth() === date.getMonth()
        && currentDate.getDate() === date.getDate())
        return (`Aujourd'hui à ${date.getHours() + 2}:${date.getMinutes() >= 0 && date.getMinutes() <= 9 ? '0' : ''}${date.getMinutes()}`);
    else if (currentDate.getFullYear() === date.getFullYear()
        && currentDate.getMonth() === date.getMonth()
        && (currentDate.getDate() - 1) === date.getDate())
        return (`Hier à ${date.getHours() + 2}:${date.getMinutes() >= 0 && date.getMinutes() <= 9 ? '0' : ''}${date.getMinutes()}`);
    else
        return (`${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`);
}

export function UserIsMute(channelUsers: ChannelUser[], userId: number): boolean {
    return channelUsers.find(elem => (elem.user.id === userId && elem.is_muted)) ? true : false;
}

export const debounce = (func: Function) => {
    let timer: any;
    return function (...args: any) {
      const context: any = debounce;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        func.apply(context, args);
      }, 7000);
    };
};