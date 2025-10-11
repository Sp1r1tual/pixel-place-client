import { create } from "zustand";

import {
  getSocket,
  connectSocket,
  disconnectSocket,
} from "@/sockets/canvasSockets";

interface IPixel {
  x: number;
  y: number;
  color: string;
}

interface ICanvasState {
  pixels: Record<string, string>;
  isConnected: boolean;
  setPixel: (x: number, y: number, color: string) => void;
  setPixelsBatch: (batch: IPixel[]) => void;
  initSocket: () => void;
  cleanupSocket: () => void;
}

const useCanvasStore = create<ICanvasState>((set) => ({
  pixels: {},
  isConnected: false,

  setPixel: (x, y, color) =>
    set((state) => ({
      pixels: { ...state.pixels, [`${x}:${y}`]: color },
    })),

  setPixelsBatch: (batch) =>
    set((state) => {
      const updated = { ...state.pixels };

      batch.forEach((p) => {
        updated[`${p.x}:${p.y}`] = p.color;
      });
      return { pixels: updated };
    }),

  initSocket: () => {
    const socket = getSocket();

    socket.on("connect", () => {
      useCanvasStore.setState({ isConnected: true });
      console.log("[socket] Connected");
    });

    socket.on("disconnect", () => {
      useCanvasStore.setState({ isConnected: false });
      console.log("[socket] Disconnected");
    });

    socket.on("canvasState", (state: Record<string, string>) => {
      useCanvasStore.setState({ pixels: state });
    });

    socket.on("updatePixels", (batch: IPixel[]) => {
      useCanvasStore.getState().setPixelsBatch(batch);
    });

    connectSocket();
  },

  cleanupSocket: () => {
    disconnectSocket();
  },
}));

export { useCanvasStore };
