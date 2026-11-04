import { create } from "zustand";
import { toast } from "react-toastify";
import { Socket } from "socket.io-client";
import i18n from "@/i18n";

import { IPixel } from "@/types";

import { getSocket } from "@/sockets/canvasSockets";

import { clearPixelLayer, paintPixels } from "@/utils/canvas/pixelLayer";

interface ICanvasState {
  /** Mutated in place for speed: subscribe to pixelsVersion to react to changes. */
  pixels: Record<string, IPixel>;
  pixelsVersion: number;
  unpaintedPixels: Record<string, string>;
  selectedColor: string;
  energy: number;
  maxEnergy: number;
  pixelReward: number;
  recoverySpeed: number;
  lastEnergyUpdate: number;
  isCanvasLoaded: boolean;
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
}

const pixelKey = (x: number, y: number) => `${x}:${y}`;

// The socket outlives this store's consumers (pages come and go), so listeners are
// bound once per socket instance. A new instance appears after a session expires.
let boundSocket: Socket | null = null;

const useCanvasStore = create<ICanvasState>((set, get) => ({
  pixels: {},
  pixelsVersion: 0,
  unpaintedPixels: {},
  selectedColor: "#000000",
  energy: 0,
  maxEnergy: 0,
  pixelReward: 0,
  recoverySpeed: 60,
  lastEnergyUpdate: Date.now(),
  isCanvasLoaded: false,

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
    const key = pixelKey(x, y);
    if (state.unpaintedPixels[key]) return;
    if (Object.keys(state.unpaintedPixels).length >= Math.floor(state.energy)) {
      toast.warn(i18n.t("errors.not-enough-energy"));
      return;
    }
    set({ unpaintedPixels: { ...state.unpaintedPixels, [key]: color } });
  },

  removeUnpaintedPixel: (x, y) =>
    set((state) => {
      const key = pixelKey(x, y);
      if (!(key in state.unpaintedPixels)) return state;
      const updated = { ...state.unpaintedPixels };
      delete updated[key];
      return { unpaintedPixels: updated };
    }),

  clearUnpaintedPixels: () => set({ unpaintedPixels: {} }),
  setSelectedColor: (color) => set({ selectedColor: color }),

  setPixelsBatch: (batch) => {
    const { pixels } = get();

    for (const pixel of batch) {
      pixels[pixelKey(pixel.x, pixel.y)] = pixel;
    }

    paintPixels(batch);
    set((state) => ({ pixelsVersion: state.pixelsVersion + 1 }));
  },

  setEnergy: (value) => set({ energy: value, lastEnergyUpdate: Date.now() }),
  setMaxEnergy: (value) => set({ maxEnergy: value }),
  setPixelReward: (value) => set({ pixelReward: value }),
  setRecoverySpeed: (value) => set({ recoverySpeed: value }),

  initSocket: () => {
    const socket = getSocket();

    if (boundSocket === socket) return;
    boundSocket = socket;

    socket.on("energyUpdate", (energy, maxEnergy, recoverySpeed, updatedAt) => {
      set({
        energy,
        maxEnergy,
        recoverySpeed,
        lastEnergyUpdate: new Date(updatedAt).getTime(),
      });
    });

    socket.on("canvasState", (pixelsArray: IPixel[]) => {
      const pixels: Record<string, IPixel> = {};

      for (const pixel of pixelsArray) {
        pixels[pixelKey(pixel.x, pixel.y)] = pixel;
      }

      clearPixelLayer();
      paintPixels(pixelsArray);

      set((state) => ({
        pixels,
        pixelsVersion: state.pixelsVersion + 1,
        isCanvasLoaded: true,
      }));
    });

    socket.on("updatePixels", (batch: IPixel[]) => get().setPixelsBatch(batch));
  },
}));

export { useCanvasStore };
