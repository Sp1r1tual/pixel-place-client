import { io, Socket } from "socket.io-client";
import { toast } from "react-toastify";

import { refreshToken } from "@/api/interceptors/authInterceptors";

let socket: Socket | null = null;
let isRefreshing = false;

const createSocket = (): Socket => {
  if (socket) return socket;

  const sock = io(import.meta.env.VITE_API_URL, {
    path: "/canvas/socket.io",
    auth: {
      authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    withCredentials: true,
    autoConnect: false,
  });

  setupSocketListeners(sock);
  socket = sock;

  return sock;
};

const setupSocketListeners = (sock: Socket) => {
  sock.on("connect_error", (err) => {
    toast.error(`Connection error: ${err.message}`);
  });

  sock.on("token_expired", async () => {
    if (isRefreshing) return;
    isRefreshing = true;

    try {
      await refreshToken();

      const newToken = localStorage.getItem("token");
      if (!newToken) throw new Error("No new token after refresh");

      sock.auth = { authorization: `Bearer ${newToken}` };
      sock.connect();
    } catch {
      toast.error("Your session has ended. Please log in again");

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
      toast.warn("Connection lost. Trying to reconnect...");
    }
  });
};

const getSocket = (): Socket => {
  return socket ?? createSocket();
};

const connectSocket = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("[socket] No token available");
    return;
  }

  const sock = getSocket();

  sock.auth = { authorization: `Bearer ${token}` };

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

export { getSocket, connectSocket, disconnectSocket, isSocketRefreshing };
