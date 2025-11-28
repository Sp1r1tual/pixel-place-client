import axios from "axios";

import { authInterceptors } from "./interceptors/authInterceptors";
import { notificationInterceptor } from "./interceptors/notificationsInterceptor";

const $apiMain = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

const $apiAuth = axios.create({
  baseURL: import.meta.env.VITE_AUTH_URL,
  withCredentials: true,
});

authInterceptors($apiMain);
notificationInterceptor($apiMain);

export { $apiMain, $apiAuth };
