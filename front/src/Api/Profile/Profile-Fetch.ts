import axios, { AxiosResponse } from "axios";
import { baseUrl } from "../../env";
import { ProfileState, UserInterface } from "../../Types/User-Types";
import { getPlayerAvatar } from "../../Utils/Utils-User";

export async function fetchProfile(username: string, token: string, setUserState: Function): Promise<AxiosResponse<any, any>> {
    return await axios.get(`${baseUrl}/users/name/${username}`, {
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    })
    // .then(response => {
    //     console.log(response);
    //     setUserState({
    //         isLoggedUser: false,
    //         user: response.data.user,
    //         friendList: response.data.friendList,
    //         match_history: response.data.match_history,
    //         relationStatus: response.data.relationStatus,
    //     });
    // })
    // .catch(err => {
    //     console.log(err);
    // })
}

export async function fetchMe(token: string): Promise<AxiosResponse<any, any>> {
    return await axios.get(`${baseUrl}/users/me`, {
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    });
}

export function fetchUploadAvatar(token: string, file: FormData) {
    axios.post(`${baseUrl}/users/avatar/upload`, {image: file.get("image")}, {
        headers: {
            "Authorization": `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
        }
    })
    .then(response => {
        console.log("Response Upload", response);
    })  
    .catch(err => {
        console.log(err);
    })

}

export function fetchGetAvatar(token: string, setUserState: Function) {
    axios.get(`${baseUrl}/users/avatar`, {
        headers: {
            "Authorization": `Bearer ${token}`,
        },
        responseType: 'arraybuffer'
    })
    .then(response => {
        console.log(response);
        const base64 = window.btoa(
            new Uint8Array(response.data).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              '',
            ),
          );
        console.log("data:;base64," + base64);
        setUserState((prev: ProfileState) => { return {...prev, user: {...prev.user, avatar: "data:;base64," + base64}}});
    })
    .catch(err => {
        console.log(err);
    })
}

export async function fetchResponseAvatar(req: Request): Promise<Response> {
    return await fetch(req);
    // .then(response => {
    //     console.log(response);
    //     const base64 = window.btoa(
    //         new Uint8Array(response.data).reduce(
    //           (data, byte) => data + String.fromCharCode(byte),
    //           '',
    //         ),
    //       );
    //     console.log("data:;base64," + base64);
    //     setUserState((prev: ProfileState) => { return {...prev, user: {...prev.user, avatar: "data:;base64," + base64}}});
    // })
    // .catch(err => {
    //     console.log(err);
    // })
}