import { useAppDispatch, useAppSelector } from "../../Redux/Hooks";
import { userIdIsBlocked } from "../../Utils/Utils-User";
import { fetchOnBlockUser, fetchOnUnblockUser } from "../../Api/User-Fetch";
import { IconBan } from "@tabler/icons";
import { replaceUserObject } from "../../Redux/AuthSlice";
import { addAlert, AlertType } from "../../Redux/AlertSlice";

function BlockButton(props: {senderId: number, isIconButton?: boolean}) {
    const {senderId, isIconButton} = props;

    const authDatas = useAppSelector((state) => state.auth);
    const senderIsBlock = userIdIsBlocked(authDatas.currentUser!, senderId);
    const dispatch = useAppDispatch();

    const onBlock = () => {
        fetchOnBlockUser(senderId)
        .then((response) => {
            dispatch(replaceUserObject(response.data));
            dispatch(addAlert({message: "User Successfully blocked", type: AlertType.SUCCESS}));
        })
        .catch((err) => {
            console.log(err);
            dispatch(addAlert({message: "Failed while block", type: AlertType.ERROR}));
        })
    }

    const onUnblock = () => {
        fetchOnUnblockUser(senderId)
        .then((response) => {
            dispatch(replaceUserObject(response.data));
            dispatch(addAlert({message: "User Successfully unblocked", type: AlertType.SUCCESS}));
        })
        .catch((err) => {
            console.log(err);
            dispatch(addAlert({message: "Failed while unblock", type: AlertType.ERROR}));
        })
    }

    return !isIconButton ? (
        <p onClick={() => senderIsBlock ? onUnblock() : onBlock()}> {senderIsBlock ? "unblock" : "block"} </p>
    ) : (
        <div className="tooltip-icon-wrapper" data-tooltips={`${senderIsBlock ? "Unblock" : "Block"}`}>
            <IconBan className='block-button' onClick={() => senderIsBlock ? onUnblock() : onBlock()} style={senderIsBlock ? {color: "red"} : {}} />
        </div>
    );
}

export default BlockButton;