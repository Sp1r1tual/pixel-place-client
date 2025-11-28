import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosError,
  AxiosResponse,
} from "axios";

import { IUserPublic } from "@/types";

import { useAuthStore } from "@/store/useAuthStore";

let refreshPromise: Promise<string> | null = null;

const refreshToken = async (): Promise<string> => {
  if (!refreshPromise) {
    refreshPromise = axios
      .get<{ accessToken: string; user: IUserPublic }>(
        `${import.meta.env.VITE_AUTH_URL}/refresh`,
        {
          withCredentials: true,
        },
      )
      .then((response) => {
        const { accessToken, user } = response.data;

        localStorage.setItem("token", accessToken);

        const { setUser } = useAuthStore.getState();
        if (user) setUser(user);

        return accessToken;
      })
      .catch((error) => {
        console.error("[Auth] Token refresh failed:", error);
        localStorage.removeItem("token");

        const { setUser } = useAuthStore.getState();

        setUser(null);
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

const authInterceptors = (axiosInstance: AxiosInstance) => {
  axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
      if (!config.headers) {
        config.headers = new axios.AxiosHeaders();
      }
      config.headers.set("Authorization", `Bearer ${token}`);
    }

    return config;
  });

  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (
      error: AxiosError & {
        config?: AxiosRequestConfig & { _retry?: boolean };
      },
    ) => {
      const originalRequest = error.config;

      const publicPaths = [
        "/login",
        "/registration",
        "/refresh",
        "/forgot-password",
      ];

      if (
        originalRequest &&
        publicPaths.some((path) => originalRequest.url?.includes(path))
      ) {
        return Promise.reject(error);
      }

      if (
        originalRequest &&
        error.response?.status === 401 &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;
        try {
          const newToken = await refreshToken();

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }

          return axiosInstance(originalRequest);
        } catch (err) {
          window.location.href = "/login";
          return Promise.reject(err);
        }
      }

      return Promise.reject(error);
    },
  );
};

export { authInterceptors, refreshToken };
