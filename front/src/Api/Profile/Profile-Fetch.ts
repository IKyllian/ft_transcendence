import axios, { AxiosResponse } from "axios";
import { baseUrl } from "../../env";

export async function fetchProfile(username: string, token: string): Promise<AxiosResponse<any, any>> {
    return await axios.get(`${baseUrl}/users/name/${username}`, {
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    })
}

export async function fetchMe(token: string): Promise<AxiosResponse<any, any>> {
    return await axios.get(`${baseUrl}/users/me`, {
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    });
}


// export async function fetchUploadAvatar(token: string, file: FormData): Promise<AxiosResponse<any, any>> {
export async function fetchUploadAvatar(token: string, file: FormData): Promise<Response> {
    return await fetch(`${baseUrl}/users/avatar/upload`, {
        method: 'POST',
        body: file, 
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    });
    // return await axios.post(`${baseUrl}/users/avatar/upload`, {image: file.get("image")}, {
    //     headers: {
    //         "Authorization": `Bearer ${token}`,
    //         'Content-Type': 'multipart/form-data',
    //     }
    // })
}

export async function fetchResponseAvatar(req: Request): Promise<Response> {
    return await fetch(req);
}