import axios from "axios";
import { TokenStorageInterface } from "../Types/Utils-Types";

export const fetchInterceptor = () => {
    const { fetch: originalFetch } = window;

    window.fetch = async (...args): Promise<Response> => {
        let [resource, config] = args;
        let response: Response = await originalFetch(resource, config);

        if (!response.ok && response.status === 401 && response.statusText === "Unauthorized") {
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
                        return window.fetch(resource, {...config, headers: {"Authorization": `Bearer ${refreshResponse.data.access_token}`}});
                    }
                } catch (_error) {
                    return Promise.reject(_error);
                }
            }
            return Promise.reject(response);
        }
        return response;
    };
}   