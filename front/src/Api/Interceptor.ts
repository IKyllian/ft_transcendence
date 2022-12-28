import axios, {
    AxiosError,
    AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse,
  } from "axios";
import { useAppHook } from "../Hooks/App-Hook";
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

const onResponseError = async (error: AxiosError): Promise<AxiosError | AxiosInstance> => {
    const {logout} = useAppHook();
    const originalConfig: AxiosRequestConfig<any> = error.config;
    if (error.response) {
        const errorData: ErrorDataInterface = error.response.data as ErrorDataInterface ;
        if (error.response.status === 401 && errorData.message === "Unauthorized") {
            const localToken: string | null = localStorage.getItem("userToken");
            if (localToken) {
                const storedToken: TokenStorageInterface = JSON.parse(localToken);  
                try {
                    const refreshResponse = await axios.post(`${process.env.REACT_APP_BASE_URL}/auth/refresh`, {}, {
                        headers: {
                            "Authorization": `Bearer ${storedToken.refresh_token}`,
                        }
                    });
                    if (refreshResponse && refreshResponse.data) {
                        localStorage.setItem("userToken", JSON.stringify(refreshResponse.data));
                        if (originalConfig.headers)
                            originalConfig.headers['Authorization'] = `Bearer ${refreshResponse.data.access_token}`;
                        return axios.create().request(originalConfig);
                    }
                } catch (_error) {
                    logout();
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