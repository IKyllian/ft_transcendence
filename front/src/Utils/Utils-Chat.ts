import { Conversation } from "../Types/Chat-Types";

export function getSecondUserIdOfPM(conversation: Conversation, userConnectedId: number): number {
    return conversation?.user1.id !== userConnectedId ? conversation?.user1.id : conversation?.user2.id;
}

export function getSecondUsernameOfPM(conversation: Conversation, userConnectedId: number): string {
    return conversation?.user1.id !== userConnectedId ? conversation?.user1.username : conversation?.user2.username;
}