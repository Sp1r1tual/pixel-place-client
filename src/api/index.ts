import axios from "axios";

import { authInterceptors } from "./interceptors/authInterceptors";

const API_URL = import.meta.env.VITE_API_URL;

const $api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

authInterceptors($api);

export { $api };
