import { io, Socket } from "socket.io-client";
import { toast } from "react-toastify";
import i18n from "@/i18n";

import { refreshToken } from "@/api/interceptors/authInterceptors";

let socket: Socket | null = null;
let isRefreshing = false;

const createSocket = (): Socket => {
  if (socket) return socket;

  const token = localStorage.getItem("token");
  const sock = io(import.meta.env.VITE_API_URL, {
    path: "/canvas/socket.io",
    auth: { authorization: token ? `Bearer ${token}` : "" },
    withCredentials: true,
    autoConnect: false,
  });

  setupListeners(sock);

  socket = sock;
  return sock;
};

const setupListeners = (sock: Socket) => {
  sock.on("server_error", (err: { message: string; errors?: string[] }) => {
    console.error("[Socket Server Error]", err);
    toast.error(i18n.t(err.message));
  });

  sock.on("connect_error", (err) => {
    toast.error(i18n.t("socket.connection-error", { message: err.message }));
  });

  sock.on("token_expired", async () => {
    if (isRefreshing) return;
    isRefreshing = true;

    try {
      await refreshToken();
      const newToken = localStorage.getItem("token");
      if (!newToken) throw new Error("No new token");

      sock.auth = { authorization: `Bearer ${newToken}` };
      if (!sock.connected) sock.connect();
    } catch {
      toast.error(i18n.t("errors.session-expired"));
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      window.dispatchEvent(new CustomEvent("socket:refresh_failed"));
    } finally {
      isRefreshing = false;
    }
  });

  sock.on("disconnect", (reason) => {
    console.log("[socket] Disconnected:", reason);
    if (!isRefreshing) {
      toast.warn(i18n.t("socket.connection-lost"));
    }
  });
};

const getSocket = (): Socket => socket ?? createSocket();

export const connectSocket = () => {
  const sock = getSocket();
  if (!sock.connected) sock.connect();
};

const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
};

const isSocketRefreshing = () => isRefreshing;

export { getSocket, disconnectSocket, isSocketRefreshing };
