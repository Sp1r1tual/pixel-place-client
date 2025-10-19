import { create } from "zustand";
import { toast } from "react-toastify";
import i18n from "@/i18n";

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
  recoverySpeed: number;
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
  setRecoverySpeed: (value: number) => void;
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
    const { energy, maxEnergy, lastEnergyUpdate, recoverySpeed } = get();
    const now = Date.now();

    if (energy >= maxEnergy) {
      return;
    }

    const secondsPassed = (now - lastEnergyUpdate) / 1000;

    const energyToAdd = secondsPassed / recoverySpeed;

    if (energyToAdd <= 0) {
      return;
    }

    const newEnergy = Math.min(energy + energyToAdd, maxEnergy);

    set({ energy: newEnergy, lastEnergyUpdate: now });
  }, 5_000);
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
  recoverySpeed: 60,
  lastEnergyUpdate: Date.now(),
  isConnected: false,
  connectionError: null,

  setPixel: (pixel: IPixel) =>
    set((state) => {
      const userId = useAuthStore.getState().user?.id;

      if (!userId) {
        toast.warn(i18n.t("errors.must-login-to-paint"));
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

    if (Object.keys(state.unpaintedPixels).length >= Math.floor(state.energy)) {
      toast.warn(i18n.t("errors.not-enough-energy"));
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

  setEnergy: (value) => {
    set({ energy: value, lastEnergyUpdate: Date.now() });
  },

  setMaxEnergy: (value) => {
    set({ maxEnergy: value });
  },

  setRecoverySpeed: (value) => {
    set({ recoverySpeed: value });
  },

  initSocket: () => {
    if (socketInitialized) return;
    socketInitialized = true;

    const socket = getSocket();

    socket.on("connect", () => {
      console.log("[Socket] Connected");
      set({ isConnected: true, connectionError: null });

      socket.emit(
        "getEnergy",
        null,
        (
          energy: number,
          maxEnergy: number,
          recoverySpeed: number,
          updatedAt?: string,
        ) => {
          set({
            energy,
            maxEnergy,
            recoverySpeed,
            lastEnergyUpdate: updatedAt
              ? new Date(updatedAt).getTime()
              : Date.now(),
          });
          startEnergyInterval(get, set);
        },
      );
    });

    socket.on("disconnect", () => {
      console.log("[Socket] Disconnected");
      set({
        isConnected: false,
        connectionError: i18n.t("socket.disconnected"),
      });
      if (!isSocketRefreshing()) stopEnergyInterval();
    });

    socket.on(
      "energyUpdate",
      (
        energy: number,
        maxEnergy?: number,
        recoverySpeed?: number,
        updatedAt?: string,
      ) => {
        set({
          energy,
          lastEnergyUpdate: updatedAt
            ? new Date(updatedAt).getTime()
            : Date.now(),
        });
        if (typeof maxEnergy === "number") set({ maxEnergy });
        if (typeof recoverySpeed === "number") set({ recoverySpeed });
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
    stopEnergyInterval();
  },
}));

export { useCanvasStore };
