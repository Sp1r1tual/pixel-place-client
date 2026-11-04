import { io, Socket } from "socket.io-client";
import { toast } from "react-toastify";
import i18n from "@/i18n";

import {
  isAuthFailure,
  refreshToken,
} from "@/api/interceptors/authInterceptors";

const MAX_CONSECUTIVE_AUTH_FAILURES = 3;
const RETRY_DELAY_MS = 5000;

let socket: Socket | null = null;
let authFailures = 0;

const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.io.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
};

const expireSession = () => {
  toast.error(i18n.t("errors.session-expired"));
  localStorage.removeItem("token");
  disconnectSocket();
  window.dispatchEvent(new CustomEvent("socket:refresh_failed"));
};

/**
 * socket.io does not retry on its own after the server rejects a handshake, so a
 * connection that outlived its access token has to refresh it and reconnect here.
 */
const recoverFromRejectedHandshake = async (sock: Socket) => {
  authFailures += 1;

  if (authFailures > MAX_CONSECUTIVE_AUTH_FAILURES) {
    expireSession();
    return;
  }

  try {
    await refreshToken();
    if (socket === sock) sock.connect();
  } catch (err) {
    if (isAuthFailure(err)) {
      expireSession();
      return;
    }

    // The API is unreachable, which says nothing about the session: try again later.
    setTimeout(() => {
      if (socket === sock) sock.connect();
    }, RETRY_DELAY_MS);
  }
};

const setupListeners = (sock: Socket) => {
  sock.on("connect", () => {
    authFailures = 0;
  });

  sock.on("server_error", (err: { message: string }) => {
    console.error("[Socket Server Error]", err);
    toast.error(i18n.t(err.message));
  });

  sock.on("connect_error", (err) => {
    console.warn("[Socket] Connect error:", err.message);

    // While active, socket.io keeps retrying by itself (e.g. the network is down).
    if (!sock.active) void recoverFromRejectedHandshake(sock);
  });

  sock.on("disconnect", (reason) => {
    console.log("[socket] Disconnected:", reason);
    toast.warn(i18n.t("socket.connection-lost"));

    if (reason === "io server disconnect") sock.connect();
  });
};

const createSocket = (): Socket => {
  const sock = io(import.meta.env.VITE_API_URL, {
    path: "/canvas/socket.io",
    // A function, so that every handshake reads the current token from storage.
    auth: (cb) => {
      const token = localStorage.getItem("token");
      cb({ authorization: token ? `Bearer ${token}` : "" });
    },
    withCredentials: true,
    timeout: 60000,
  });

  setupListeners(sock);

  socket = sock;
  return sock;
};

const getSocket = (): Socket => socket ?? createSocket();

export { getSocket, disconnectSocket };
