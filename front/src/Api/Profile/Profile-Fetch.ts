import { AxiosResponse } from "axios";
import { baseUrl } from "../../env";
import api from "../Api";
import { fetchInterceptor } from "../Interceptor-Fetch";

export async function fetchProfile(username: string): Promise<AxiosResponse<any, any>> {
    return await api.get(`/users/name/${username}`)
}

export async function fetchMe(): Promise<AxiosResponse<any, any>> {
    return await api.get(`/users/me`);
}

export async function fetchUploadAvatar(token: string, file: FormData): Promise<Response> {
    fetchInterceptor();
    return await fetch(`${baseUrl}/users/avatar/upload`, {
        method: 'POST',
        body: file, 
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    });
}

export async function fetchResponseAvatar(req: Request): Promise<Response> {
    fetchInterceptor();
    return await fetch(req);
}