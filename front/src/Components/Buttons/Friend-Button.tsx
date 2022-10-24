import { IconUserPlus, IconUserX, IconUser } from '@tabler/icons';

function FriendButton(props: {secondUserId: number, relationStatus: string}) {
    const { secondUserId, relationStatus } = props;
    
    const acceptRequest = () => {

    }

    const declineRequest = () => {
        
    }

    const addFriend = () => {

    }

    const removeFriend = () => {

    }

    if (relationStatus === "none") {
        return (
            <IconUserPlus onClick={() => addFriend()} className="friend-icone friend-icone-add" />
        );
    } else if (relationStatus === "pending") {
        return (
            <p className='friend-request-pending'> Friend Request Pending </p>
        );
    } else if (relationStatus === "friend") {
        return (
            <IconUserX onClick={() => removeFriend()} className="friend-icone friend-icone-add" />
        );
    } else {
        return (
            <div className='buttons-friend-request'>
                <button onClick={() => acceptRequest()}> Accept friend </button>
                <button onClick={() => declineRequest()}> Decline </button>
            </div>
        );
    }
}

export default FriendButton;