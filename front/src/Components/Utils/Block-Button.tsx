import axios from "axios";
import { baseUrl } from "../../env";
import { useAppDispatch, useAppSelector } from "../../Redux/Hooks";
import { replaceUserObject } from "../../Redux/AuthSlice";
import { userIdIsBlocked } from "../../Utils/Utils-User";

function BlockButton(props: {senderId: number}) {
    const {senderId} = props;

    const authDatas = useAppSelector((state) => state.auth);
    const senderIsBlock = userIdIsBlocked(authDatas.currentUser!, senderId);
    const dispatch = useAppDispatch();

    const onBlock = () => {
        axios.post(`${baseUrl}/users/${senderId}/block`, {}, {
            headers: {
                "Authorization": `Bearer ${authDatas.token}`,
            }
        })
        .then((response) => {
            dispatch(replaceUserObject(response.data));
        })
        .catch((err) => {
            console.log(err);
        })
    }

    const onUnblock = () => {
        axios.post(`${baseUrl}/users/${senderId}/deblock`, {}, {
            headers: {
                "Authorization": `Bearer ${authDatas.token}`,
            }
        })
        .then((response) => {
            dispatch(replaceUserObject(response.data));
        })
        .catch((err) => {
            console.log(err);
        })
    }

    return (
        <p onClick={() => senderIsBlock ? onUnblock() : onBlock()}> {senderIsBlock ? "unblock" : "block"} </p>
    );
}

export default BlockButton;