import { io, Socket } from "socket.io-client";

import { refreshToken } from "@/api/interceptors/authInterceptors";

let socket: Socket | null = null;
let isRefreshing = false;

const createSocket = (): Socket => {
  if (socket) {
    socket.removeAllListeners();
    socket.close();
    socket = null;
  }

  return io(import.meta.env.VITE_API_URL, {
    path: "/canvas/socket.io",
    auth: {
      authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    withCredentials: true,
    autoConnect: false,
  });
};

const setupSocketListeners = (sock: Socket) => {
  sock.on("connect_error", (err) => {
    console.error("[socket] Connection error:", err.message);
  });

  sock.on("token_expired", async () => {
    isRefreshing = true;
    sock.disconnect();

    try {
      await refreshToken();

      socket = createSocket();
      setupSocketListeners(socket);
      socket.auth = {
        authorization: `Bearer ${localStorage.getItem("token")}`,
      };
      socket.connect();

      isRefreshing = false;
    } catch (err) {
      console.error("[socket] Token refresh failed:", err);
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      isRefreshing = false;

      window.dispatchEvent(new CustomEvent("socket:refresh_failed"));
    }
  });

  sock.on("disconnect", () => {
    console.log("[socket] Disconnected");
  });
};

const getSocket = (): Socket => {
  if (!socket) {
    socket = createSocket();
    setupSocketListeners(socket);
  }
  return socket;
};

const connectSocket = async () => {
  const token = localStorage.getItem("token");
  if (!token) return console.error("[socket] No token available");

  const sock = getSocket();

  sock.auth = {
    authorization: `Bearer ${token}`,
  };

  if (!sock.connected) sock.connect();
};

const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.close();
    socket = null;
  }
};

const isSocketRefreshing = () => isRefreshing;

export { getSocket, connectSocket, disconnectSocket, isSocketRefreshing };
