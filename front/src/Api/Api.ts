import axios, {
    AxiosError,
    AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse,
} from "axios";
import { useContext, useEffect } from "react";
import { SocketContext } from "../App";
import { TokenStorageInterface } from "../Types/Utils-Types";

interface ErrorDataInterface {
    message: string,
    statusCode: number,

}
interface Props {
    children: any,
}

const api = axios.create({
	    baseURL: process.env.REACT_APP_BASE_URL,
	    headers: {
	      "Content-Type": "application/json",
	    },
})

function AxiosInterceptor({ children }: Props) {
	const {socket} = useContext(SocketContext);

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
							// return axios.create().request(originalConfig);
							return api.request(originalConfig);
						}
					} catch (_error) {
						socket?.emit("Logout");
						return Promise.reject(_error);
					}
				}
			}
		}
		return Promise.reject(error);
	};

	useEffect(() => {
		const requestInterceptor = api.interceptors.request.use(onRequest, onRequestError);
		const responseInterceptor = api.interceptors.response.use(onResponse, onResponseError);

		return () => {
			if (socket) {
				api.interceptors.request.eject(requestInterceptor);
				api.interceptors.response.eject(responseInterceptor);
			}
		}
	}, [socket]);

	return children;
}

export default api;
export {AxiosInterceptor};