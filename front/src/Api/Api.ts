import axios from "axios";
import { baseUrl } from "../env";
import { setupInterceptorsTo } from "./Interceptor";

const api = setupInterceptorsTo(
  axios.create({
    baseURL: baseUrl,
    headers: {
      "Content-Type": "application/json",
    },
  })
);

export default api;