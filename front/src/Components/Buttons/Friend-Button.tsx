import { IconUserPlus, IconUserX, IconUser } from '@tabler/icons';
import { useFriendHook } from '../../Hooks/Friend-Hook';

function FriendButton(props: {secondUserId: number, relationStatus: string}) {
    const { secondUserId, relationStatus } = props;
    const {
        handleAddFriend,
        handleRemoveFriend,
        replieFriendRequest,
    } = useFriendHook();
    
    if (relationStatus === "none") {
        return (
            <IconUserPlus onClick={() => handleAddFriend(secondUserId)} className="friend-icone friend-icone-add" />
        );
    } else if (relationStatus === "pending") {
        return (
            <p className='friend-request-pending'> Friend Request Pending </p>
        );
    } else if (relationStatus === "friend") {
        return (
            <IconUserX onClick={() => handleRemoveFriend(secondUserId)} className="friend-icone friend-icone-add" />
        );
    } else {
        return (
            <div className='buttons-friend-request'>
                <button onClick={() => replieFriendRequest(secondUserId, "accepted")}> Accept friend </button>
                <button onClick={() => replieFriendRequest(secondUserId, "declined")}> Decline </button>
            </div>
        );
    }
}

export default FriendButton;