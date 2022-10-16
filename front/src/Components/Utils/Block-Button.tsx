import { useAppDispatch, useAppSelector } from "../../Redux/Hooks";
import { userIdIsBlocked } from "../../Utils/Utils-User";
import { fetchOnBlockUser, fetchOnUnblockUser } from "../../Api/User-Fetch";

function BlockButton(props: {senderId: number}) {
    const {senderId} = props;

    const authDatas = useAppSelector((state) => state.auth);
    const senderIsBlock = userIdIsBlocked(authDatas.currentUser!, senderId);
    const dispatch = useAppDispatch();

    const onBlock = () => {
        fetchOnBlockUser({senderId: senderId, token: authDatas.token, dispatch: dispatch});
    }

    const onUnblock = () => {
        fetchOnUnblockUser({senderId: senderId, token: authDatas.token, dispatch: dispatch});
    }

    return (
        <p onClick={() => senderIsBlock ? onUnblock() : onBlock()}> {senderIsBlock ? "unblock" : "block"} </p>
    );
}

export default BlockButton;