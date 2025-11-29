import { create } from "zustand";
import { toast } from "react-toastify";
import i18n from "@/i18n";

import { IPixel } from "@/types";

import { useAuthStore } from "./useAuthStore";

import { getSocket } from "@/sockets/canvasSockets";

import { formatDateTime } from "@/utils/date/formatDate";

interface ICanvasState {
  pixels: Record<string, IPixel>;
  unpaintedPixels: Record<string, string>;
  selectedColor: string;
  energy: number;
  maxEnergy: number;
  pixelReward: number;
  recoverySpeed: number;
  lastEnergyUpdate: number;
  isConnected: boolean;
  connectionError: string | null;
  isCanvasLoaded: boolean;
  setPixel: (pixel: IPixel) => void;
  addUnpaintedPixel: (x: number, y: number, color: string) => void;
  removeUnpaintedPixel: (x: number, y: number) => void;
  undoLastPixel: () => void;
  clearUnpaintedPixels: () => void;
  setSelectedColor: (color: string) => void;
  setPixelsBatch: (batch: IPixel[]) => void;
  setPixelReward: (value: number) => void;
  setEnergy: (value: number) => void;
  setRecoverySpeed: (value: number) => void;
  setMaxEnergy: (value: number) => void;
  initSocket: () => void;
  cleanupSocket: () => void;
}

let socketInitialized = false;

const useCanvasStore = create<ICanvasState>((set, get) => ({
  pixels: {},
  unpaintedPixels: {},
  selectedColor: "#000000",
  energy: 0,
  maxEnergy: 0,
  pixelReward: 0,
  recoverySpeed: 60,
  lastEnergyUpdate: Date.now(),
  isConnected: false,
  connectionError: null,
  isCanvasLoaded: false,

  setPixel: (pixel: IPixel) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) {
      toast.warn(i18n.t("errors.must-login-to-paint"));
      return;
    }
    set((state) => ({
      pixels: {
        ...state.pixels,
        [`${pixel.x}:${pixel.y}`]: {
          ...pixel,
          userId,
          placedAt: pixel.placedAt,
        },
      },
    }));
  },

  undoLastPixel: () =>
    set((state) => {
      const keys = Object.keys(state.unpaintedPixels);
      const lastKey = keys.at(-1);
      if (!lastKey) return {};
      const updated = { ...state.unpaintedPixels };
      delete updated[lastKey];
      return { unpaintedPixels: updated };
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
        updated[`${p.x}:${p.y}`] = {
          ...p,
          userId: p.userId ?? userId,
          placedAt: p.placedAt,
        };
      }
      return { pixels: updated };
    }),

  setEnergy: (value) => set({ energy: value, lastEnergyUpdate: Date.now() }),
  setMaxEnergy: (value) => set({ maxEnergy: value }),
  setPixelReward: (value) => set({ pixelReward: value }),
  setRecoverySpeed: (value) => set({ recoverySpeed: value }),

  initSocket: () => {
    if (socketInitialized) return;
    socketInitialized = true;

    const socket = getSocket();

    socket.on("connect", () => {
      console.log("[Socket] Connected");

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
            isConnected: true,
            connectionError: null,
            energy,
            maxEnergy,
            recoverySpeed,
            lastEnergyUpdate: updatedAt
              ? new Date(updatedAt).getTime()
              : Date.now(),
          });
        },
      );
    });

    socket.on("disconnect", () => {
      console.log("[Socket] Disconnected");
      set({
        isConnected: false,
        isCanvasLoaded: false,
        connectionError: i18n.t("socket.disconnected"),
      });
    });

    socket.on("energyUpdate", (energy, maxEnergy, recoverySpeed, updatedAt) => {
      set({
        energy,
        lastEnergyUpdate: updatedAt
          ? new Date(updatedAt).getTime()
          : Date.now(),
        ...(typeof maxEnergy === "number" ? { maxEnergy } : {}),
        ...(typeof recoverySpeed === "number" ? { recoverySpeed } : {}),
      });
    });

    socket.on("canvasState", (pixelsArray: IPixel[]) => {
      const pixelsMap: Record<string, IPixel> = {};
      for (const pixel of pixelsArray) {
        pixelsMap[`${pixel.x}:${pixel.y}`] = {
          ...pixel,
          placedAt: formatDateTime(pixel.placedAt),
        };
      }
      set({
        pixels: pixelsMap,
        isCanvasLoaded: true,
      });
    });

    socket.on("updatePixels", (batch: IPixel[]) => get().setPixelsBatch(batch));
  },

  cleanupSocket: () => {
    socketInitialized = false;
  },
}));

export { useCanvasStore };
