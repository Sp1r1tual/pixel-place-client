import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { toast } from "react-toastify";

const ALLOWED_NOTIFICATION_ENDPOINTS = ["/canvas/socket.io"] as const;

type ServerMessage =
  | string
  | {
      text: string;
      type?: "success" | "error" | "warn" | "warning" | "info";
    };

const showMessage = (msg: ServerMessage): void => {
  if (typeof msg === "string") {
    toast(msg);
    return;
  }

  if (msg && typeof msg === "object" && "text" in msg) {
    const { text, type = "info" } = msg;

    switch (type) {
      case "success":
        toast.success(text);
        break;
      case "error":
        toast.error(text);
        break;
      case "warn":
      case "warning":
        toast.warn(text);
        break;
      default:
        toast.info(text);
    }
  }
};

const shouldShowNotification = (config?: AxiosRequestConfig): boolean => {
  if (!config?.url) return false;

  return ALLOWED_NOTIFICATION_ENDPOINTS.some((endpoint) =>
    config.url!.includes(endpoint),
  );
};

const notificationInterceptor = (axiosInstance: AxiosInstance): void => {
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      const { message, messages } = response.data ?? {};

      if (!shouldShowNotification(response.config)) return response;

      if (Array.isArray(messages)) messages.forEach(showMessage);
      if (message) showMessage(message);

      return response;
    },

    (error) => {
      const status = error.response?.status;
      const errMsg: string | undefined = error.response?.data?.message;
      const config: AxiosRequestConfig = error.config ?? {};

      const isNotAuthError = status !== 401 && status !== 403;
      const isAllowed = shouldShowNotification(config);

      if (errMsg && isNotAuthError && isAllowed) {
        toast.error(errMsg);
      }

      return Promise.reject(error);
    },
  );
};

export { notificationInterceptor };
