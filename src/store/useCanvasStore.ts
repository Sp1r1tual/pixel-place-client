import { create } from "zustand";
import { toast } from "react-toastify";

import { useAuthStore } from "./useAuthStore";
import { IPixel } from "@/types";

import {
  getSocket,
  connectSocket,
  isSocketRefreshing,
} from "@/sockets/canvasSockets";

interface ICanvasState {
  pixels: Record<string, IPixel>;
  unpaintedPixels: Record<string, string>;
  selectedColor: string;
  energy: number;
  maxEnergy: number;
  lastEnergyUpdate: number;
  isConnected: boolean;
  connectionError: string | null;
  setPixel: (pixel: IPixel) => void;
  addUnpaintedPixel: (x: number, y: number, color: string) => void;
  removeUnpaintedPixel: (x: number, y: number) => void;
  clearUnpaintedPixels: () => void;
  setSelectedColor: (color: string) => void;
  setPixelsBatch: (batch: IPixel[]) => void;
  setEnergy: (value: number) => void;
  setMaxEnergy: (value: number) => void;
  initSocket: () => void;
  cleanupSocket: () => void;
}

let socketInitialized = false;
let energyInterval: ReturnType<typeof setInterval> | null = null;

const startEnergyInterval = (
  get: () => ICanvasState,
  set: (
    partial:
      | Partial<ICanvasState>
      | ((state: ICanvasState) => Partial<ICanvasState>),
  ) => void,
) => {
  if (energyInterval) return;
  energyInterval = setInterval(() => {
    const { energy, maxEnergy, lastEnergyUpdate } = get();
    const now = Date.now();
    const minutesPassed = Math.floor((now - lastEnergyUpdate) / 60_000);

    if (minutesPassed > 0 && energy < maxEnergy) {
      const newEnergy = Math.min(energy + minutesPassed, maxEnergy);
      set({ energy: newEnergy, lastEnergyUpdate: now });
    }
  }, 10_000);
};

const stopEnergyInterval = () => {
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
  lastEnergyUpdate: Date.now(),
  isConnected: false,
  connectionError: null,

  setPixel: (pixel: IPixel) =>
    set((state) => {
      const userId = useAuthStore.getState().user?.id;

      if (!userId) {
        toast.warn("You must be logged in to place pixels");
        return state;
      }

      return {
        pixels: {
          ...state.pixels,
          [`${pixel.x}:${pixel.y}`]: { ...pixel, userId },
        },
      };
    }),

  addUnpaintedPixel: (x, y, color) => {
    const state = get();
    const key = `${x}:${y}`;
    if (state.unpaintedPixels[key]) return;

    if (Object.keys(state.unpaintedPixels).length >= state.energy) {
      toast.warn("Not enough energy to add more pixels");
      return;
    }

    set({ unpaintedPixels: { ...state.unpaintedPixels, [key]: color } });
  },

  removeUnpaintedPixel: (x, y) =>
    set((state) => {
      const key = `${x}:${y}`;
      if (!(key in state.unpaintedPixels)) return state;
      const updated = { ...state.unpaintedPixels };
      delete updated[key];
      return { unpaintedPixels: updated };
    }),

  clearUnpaintedPixels: () => set({ unpaintedPixels: {} }),

  setSelectedColor: (color) => set({ selectedColor: color }),

  setPixelsBatch: (batch: IPixel[]) =>
    set((state) => {
      const userId = useAuthStore.getState().user?.id ?? null;
      const updated = { ...state.pixels };
      for (const p of batch) {
        updated[`${p.x}:${p.y}`] = { ...p, userId: p.userId ?? userId };
      }
      return { pixels: updated };
    }),

  setEnergy: (value) => set({ energy: value, lastEnergyUpdate: Date.now() }),

  setMaxEnergy: (value) => set({ maxEnergy: value }),

  initSocket: () => {
    if (socketInitialized) return;
    socketInitialized = true;

    const socket = getSocket();

    socket.on("connect", () => {
      set({ isConnected: true, connectionError: null });

      socket.emit(
        "getEnergy",
        null,
        (energy: number, maxEnergy: number, updatedAt?: string) => {
          set({
            energy,
            maxEnergy,
            lastEnergyUpdate: updatedAt
              ? new Date(updatedAt).getTime()
              : Date.now(),
          });
          startEnergyInterval(get, set);
        },
      );
    });

    socket.on("disconnect", () => {
      set({ isConnected: false, connectionError: "Disconnected from server" });
      if (!isSocketRefreshing()) stopEnergyInterval();
    });

    socket.on(
      "energyUpdate",
      (energy: number, maxEnergy?: number, updatedAt?: string) => {
        set({
          energy,
          lastEnergyUpdate: updatedAt
            ? new Date(updatedAt).getTime()
            : Date.now(),
        });
        if (typeof maxEnergy === "number") set({ maxEnergy });
        startEnergyInterval(get, set);
      },
    );

    socket.on("canvasState", (pixelsArray: IPixel[]) => {
      const pixelsMap: Record<string, IPixel> = {};
      for (const pixel of pixelsArray) {
        pixelsMap[`${pixel.x}:${pixel.y}`] = pixel;
      }
      set({ pixels: pixelsMap });
    });

    socket.on("updatePixels", (batch: IPixel[]) => get().setPixelsBatch(batch));

    connectSocket();
  },

  cleanupSocket: () => {
    socketInitialized = false;
  },
}));

export { useCanvasStore };
