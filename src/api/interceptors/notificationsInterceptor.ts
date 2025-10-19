import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { toast } from "react-toastify";
import i18n from "@/i18n";

const ALLOWED_NOTIFICATION_ENDPOINTS = ["/canvas/socket.io", "/shop"] as const;

type ServerMessage =
  | string
  | {
      text: string;
      type?: "success" | "error" | "warn" | "warning" | "info";
    };

const showMessage = (msg: ServerMessage): void => {
  let text: string;
  let type: "success" | "error" | "warn" | "warning" | "info" = "info";

  if (typeof msg === "string") {
    text = i18n.exists(msg) ? i18n.t(msg) : msg;
  } else {
    text = i18n.exists(msg.text) ? i18n.t(msg.text) : msg.text;
    type = msg.type ?? "info";
  }

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
        showMessage(errMsg);
      }

      return Promise.reject(error);
    },
  );
};

export { notificationInterceptor };
