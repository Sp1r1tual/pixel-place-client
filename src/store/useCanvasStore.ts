import { create } from "zustand";

import {
  getSocket,
  connectSocket,
  disconnectSocket,
  isSocketRefreshing,
} from "@/sockets/canvasSockets";

interface IPixel {
  x: number;
  y: number;
  color: string;
}

interface ICanvasState {
  pixels: Record<string, string>;
  isConnected: boolean;
  connectionError: string | null;
  setPixel: (x: number, y: number, color: string) => void;
  setPixelsBatch: (batch: IPixel[]) => void;
  initSocket: () => void;
  cleanupSocket: () => void;
  setConnectionError: (error: string | null) => void;
}

let socketInitialized = false;
let refreshListenerAdded = false;

const resetSocketState = () => {
  socketInitialized = false;
  refreshListenerAdded = false;
};

const useCanvasStore = create<ICanvasState>((set) => ({
  pixels: {},
  isConnected: false,
  connectionError: null,

  setPixel: (x, y, color) =>
    set((state) => ({ pixels: { ...state.pixels, [`${x}:${y}`]: color } })),

  setPixelsBatch: (batch) =>
    set((state) => {
      const updated = { ...state.pixels };
      for (const p of batch) updated[`${p.x}:${p.y}`] = p.color;
      return { pixels: updated };
    }),

  setConnectionError: (error) => set({ connectionError: error }),

  initSocket: () => {
    if (socketInitialized) return;
    socketInitialized = true;

    const socket = getSocket();

    socket.on("connect", () =>
      set({ isConnected: true, connectionError: null }),
    );
    socket.on("disconnect", () => {
      if (!isSocketRefreshing())
        set({ isConnected: false, connectionError: "Connection lost" });
    });
    socket.on("canvasState", (state: Record<string, string>) =>
      set({ pixels: state }),
    );
    socket.on("updatePixels", (batch: IPixel[]) =>
      useCanvasStore.getState().setPixelsBatch(batch),
    );

    if (!refreshListenerAdded) {
      refreshListenerAdded = true;
      window.addEventListener("socket:refresh_failed", () => {
        console.warn("[socket] Global refresh fail — logging out");
        resetSocketState();
        set({ isConnected: false, connectionError: "Session expired" });
        disconnectSocket();
      });
    }

    connectSocket();
  },

  cleanupSocket: () => {
    socketInitialized = false;
    disconnectSocket();
  },
}));

export { useCanvasStore };
