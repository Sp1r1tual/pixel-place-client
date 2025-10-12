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
  selectedColor: string;
  isConnected: boolean;
  connectionError: string | null;
  setPixel: (x: number, y: number, color: string) => void;
  setSelectedColor: (color: string) => void;
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
  selectedColor: "#000000",
  isConnected: false,
  connectionError: null,

  setPixel: (x, y, color) => {
    console.log("[store] setPixel:", { x, y, color });
    set((state) => ({ pixels: { ...state.pixels, [`${x}:${y}`]: color } }));
  },

  setSelectedColor: (color) => {
    console.log("[store] setSelectedColor:", color);
    set({ selectedColor: color });
  },

  setPixelsBatch: (batch) => {
    console.log("[store] setPixelsBatch:", batch);
    set((state) => {
      const updated = { ...state.pixels };
      for (const p of batch) {
        updated[`${p.x}:${p.y}`] = p.color;
      }
      return { pixels: updated };
    });
  },

  setConnectionError: (error) => {
    console.log("[store] setConnectionError:", error);
    set({ connectionError: error });
  },

  initSocket: () => {
    if (socketInitialized) return;
    socketInitialized = true;

    const socket = getSocket();

    socket.on("connect", () => {
      console.log("[socket] connected");
      set({ isConnected: true, connectionError: null });
    });
    socket.on("disconnect", () => {
      console.log("[socket] disconnected");
      if (!isSocketRefreshing())
        set({ isConnected: false, connectionError: "Connection lost" });
    });
    socket.on("canvasState", (state: Record<string, string>) => {
      console.log("[socket] canvasState received", state);
      set({ pixels: state });
    });
    socket.on("updatePixels", (batch: IPixel[]) => {
      console.log("[socket] updatePixels received", batch);
      useCanvasStore.getState().setPixelsBatch(batch);
    });

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
    console.log("[store] cleanupSocket");
    socketInitialized = false;
    disconnectSocket();
  },
}));

export { useCanvasStore };
