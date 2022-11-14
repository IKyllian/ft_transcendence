import axios from "axios";
import { baseUrl } from "../../env";
import { UserInterface } from "../../Types/User-Types";

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
            match_history: response.data.match_history,
            relationStatus: response.data.relationStatus,
        });
    })
    .catch(err => {
        console.log(err);
    })
}

export function fetchMe(token: string, setUserState: Function, friendList: UserInterface[]) {
    axios.get(`${baseUrl}/users/me`, {
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    })
    .then((response) => {
        console.log("Response Me", response);
        setUserState({
            isLoggedUser: true,
            user: response.data.user,
            match_history: response.data.match_history,
            friendList: friendList,
        });
    })
    .catch((err) => {
        console.log(err);
    })
}