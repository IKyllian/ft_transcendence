import { AxiosResponse } from "axios";
import { Socket } from "socket.io-client";
import api from "../Api";
import { fetchInterceptor } from "../Interceptor-Fetch";

export async function fetchProfile(username: string): Promise<AxiosResponse<any, any>> {
    return await api.get(`/users/name/${username}`)
}

export async function fetchMe(): Promise<AxiosResponse<any, any>> {
    return await api.get(`/users/me`);
}

export async function fetchUploadAvatar(token: string, file: FormData, socket: Socket | undefined): Promise<Response> {
    fetchInterceptor(socket);
    return await fetch(`${process.env.REACT_APP_BASE_URL}/users/avatar/upload`, {
        method: 'POST',
        body: file,
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    });
}

export async function fetchResponseAvatar(req: Request, socket: Socket | undefined): Promise<Response> {
    fetchInterceptor(socket);
    return await fetch(req);
}