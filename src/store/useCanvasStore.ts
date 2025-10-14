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
  energy: number;
  maxEnergy: number;
  isConnected: boolean;
  connectionError: string | null;
  setPixel: (x: number, y: number, color: string) => void;
  addUnpaintedPixel: (x: number, y: number, color: string) => void;
  clearUnpaintedPixels: () => void;
  setSelectedColor: (color: string) => void;
  setPixelsBatch: (batch: IPixel[]) => void;
  setEnergy: (value: number) => void;
  setMaxEnergy: (value: number) => void;
  initSocket: () => void;
  cleanupSocket: () => void;
  setConnectionError: (error: string | null) => void;
}

let socketInitialized = false;
let refreshListenerAdded = false;
let energyInterval: ReturnType<typeof setInterval> | null = null;

const resetSocketState = () => {
  socketInitialized = false;
  refreshListenerAdded = false;
  if (energyInterval) {
    clearInterval(energyInterval);
    energyInterval = null;
  }
};

const useCanvasStore = create<ICanvasState>((set, get) => ({
  pixels: {},
  unpaintedPixels: {},
  selectedColor: "#000000",
  energy: 0,
  maxEnergy: 0,
  isConnected: false,
  connectionError: null,

  setPixel: (x, y, color) =>
    set((state) => ({ pixels: { ...state.pixels, [`${x}:${y}`]: color } })),
  addUnpaintedPixel: (x, y, color) =>
    set((state) => ({
      unpaintedPixels: { ...state.unpaintedPixels, [`${x}:${y}`]: color },
    })),
  clearUnpaintedPixels: () => set({ unpaintedPixels: {} }),
  setSelectedColor: (color) => set({ selectedColor: color }),
  setPixelsBatch: (batch) =>
    set((state) => {
      const updated = { ...state.pixels };
      for (const p of batch) updated[`${p.x}:${p.y}`] = p.color;
      return { pixels: updated };
    }),

  setEnergy: (value: number) => set({ energy: value }),
  setMaxEnergy: (value: number) => set({ maxEnergy: value }),

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

      socket.emit("getEnergy", null, (energy: number, maxEnergy: number) => {
        set({ energy, maxEnergy });

        if (!energyInterval) {
          energyInterval = setInterval(() => {
            const { energy, maxEnergy } = get();
            if (energy < maxEnergy) set({ energy: energy + 1 });
          }, 60_000);
        }
      });
    });

    socket.on("energyUpdate", (energy: number, maxEnergy?: number) => {
      set({ energy });
      if (typeof maxEnergy === "number") {
        set({ maxEnergy });
      }
    });

    socket.on("disconnect", () => {
      console.log("[socket] disconnected");
      if (!isSocketRefreshing())
        set({ isConnected: false, connectionError: "Connection lost" });
    });

    socket.on("canvasState", (state: Record<string, string>) =>
      set({ pixels: state }),
    );
    socket.on("updatePixels", (batch: IPixel[]) => get().setPixelsBatch(batch));

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
    if (energyInterval) {
      clearInterval(energyInterval);
      energyInterval = null;
    }
  },
}));

export { useCanvasStore };
