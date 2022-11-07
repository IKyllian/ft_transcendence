import axios from "axios";
import { baseUrl } from "../../env";

export function fetchProfile(username: string, token: string, setUserState: Function) {
    axios.get(`${baseUrl}/users/name/${username}`, {
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    })
    .then(response => {
        console.log(response);
        setUserState({
            isLoggedUser: false,
            user: response.data.user,
            friendList: response.data.friendList,
            relationStatus: response.data.relationStatus,
        });
    })
    .catch(err => {
        console.log(err);
    })
}