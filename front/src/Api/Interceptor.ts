import axios, {
    AxiosError,
    AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse,
  } from "axios";
import { baseUrl } from "../env";
import { TokenStorageInterface } from "../Types/Utils-Types";

interface ErrorDataInterface {
    message: string,
    statusCode: number,
}
    
const onRequest = (config: AxiosRequestConfig): AxiosRequestConfig => {
    const localToken: string | null = localStorage.getItem("userToken");
    if (localToken) {
        const storedToken: TokenStorageInterface = JSON.parse(localToken);
        if (config.headers)
            config.headers["Authorization"] = `Bearer ${storedToken.access_token}`;
    }
    return config;
};

const onRequestError = (error: AxiosError): Promise<AxiosError> => {
    return Promise.reject(error);
};

const onResponse = (response: AxiosResponse): AxiosResponse => {
    return response;
};

const onResponseError = async (error: AxiosError): Promise<AxiosError> => {
    console.log("ERROR", error);
    if (error.response) {
        const errorData: ErrorDataInterface = error.response.data as ErrorDataInterface ;
        if (error.response.status === 401 && errorData.message === "Unauthorized") {
            const localToken: string | null = localStorage.getItem("userToken");
            if (localToken) {
                const storedToken: TokenStorageInterface = JSON.parse(localToken);  
                try {
                    console.log("storedToken", storedToken);
                    const rs = await axios.post(`${baseUrl}/auth/refresh`, {}, {
                        headers: {
                            "Authorization": `Bearer ${storedToken.refresh_token}`,
                        }
                    });

                    console.log("!!!!!!!! NEW TOKEN !!!!!!!!", rs.data);

                    // const { token, user } = rs.data;
            
                    localStorage.setItem("token", JSON.stringify(rs.data));
                    // localStorage.setItem("user", JSON.stringify(user));

                } catch (_error) {
                    return Promise.reject(_error);
                }
            }
        }
    }
    return Promise.reject(error);
};

export const setupInterceptorsTo = ( axiosInstance: AxiosInstance ): AxiosInstance => {
    axiosInstance.interceptors.request.use(onRequest, onRequestError);
    axiosInstance.interceptors.response.use(onResponse, onResponseError);
    return axiosInstance;
};