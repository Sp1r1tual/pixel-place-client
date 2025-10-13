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
  unpaintedPixels: Record<string, string>;
  selectedColor: string;
  isConnected: boolean;
  connectionError: string | null;
  setPixel: (x: number, y: number, color: string) => void;
  addUnpaintedPixel: (x: number, y: number, color: string) => void;
  clearUnpaintedPixels: () => void;
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
  unpaintedPixels: {},
  selectedColor: "#000000",
  isConnected: false,
  connectionError: null,

  setPixel: (x, y, color) => {
    set((state) => ({
      pixels: { ...state.pixels, [`${x}:${y}`]: color },
    }));
  },

  addUnpaintedPixel: (x, y, color) => {
    set((state) => ({
      unpaintedPixels: { ...state.unpaintedPixels, [`${x}:${y}`]: color },
    }));
  },

  clearUnpaintedPixels: () => {
    set({ unpaintedPixels: {} });
  },

  setSelectedColor: (color) => {
    set({ selectedColor: color });
  },

  setPixelsBatch: (batch) => {
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
      set({ pixels: state });
    });

    socket.on("updatePixels", (batch: IPixel[]) => {
      useCanvasStore.getState().setPixelsBatch(batch);
    });

    if (!refreshListenerAdded) {
      refreshListenerAdded = true;
      window.addEventListener("socket:refresh_failed", () => {
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
