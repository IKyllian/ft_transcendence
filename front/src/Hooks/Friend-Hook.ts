import { useContext } from "react";
import { SocketContext } from "../App";

export function useFriendHook() {
    const {socket} = useContext(SocketContext);

    const handleAddFriend = (userIdToAccept: number) => {
            socket?.emit("FriendRequest", {
                id: userIdToAccept,
            });        
    }

    const handleRemoveFriend = (userIdToRemove: number) => {
        socket?.emit("UnFriend", {
            id: userIdToRemove,
        })
    }

    const replieFriendRequest = (requesterId: number, response: string) => {
        socket?.emit("FriendRequestResponse", {id: requesterId, response: response})
    }

    return {
        handleAddFriend,
        handleRemoveFriend,
        replieFriendRequest,
    };
}