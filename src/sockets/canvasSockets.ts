import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

const getSocket = (): Socket => {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL, {
      path: "/canvas/socket.io",
      auth: {
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      withCredentials: true,
      autoConnect: false,
    });

    socket.on("connect_error", (err) => {
      console.error("[socket] Connection error:", err.message);
    });

    socket.on("token_expired", () => {
      console.warn("[socket] Token expired — disconnecting");
      socket?.disconnect();
    });
  }

  return socket;
};

const connectSocket = () => {
  const sock = getSocket();

  if (!sock.connected) {
    sock.connect();
  }
};

const disconnectSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect();
  }
};

export { getSocket, connectSocket, disconnectSocket };
