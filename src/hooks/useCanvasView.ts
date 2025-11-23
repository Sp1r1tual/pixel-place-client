import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

import { IPixel } from "@/types/canvas";

import { useAuthStore } from "@/store/useAuthStore";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useShopStore } from "@/store/useShopStore";
import { useUserInterface } from "@/store/useUserInterface";

import { getSocket } from "@/sockets/canvasSockets";

import { playTapSound } from "@/utils/sfx/playTapSound";

import tapSoundMp3 from "@/assets/sounds/key-hit-sound.mp3";

const useCanvasView = () => {
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEraserActive, setIsEraserActive] = useState(false);
  const [selectedPixel, setSelectedPixel] = useState<IPixel | null>(null);

  const { isHidden, toggleInterface } = useUserInterface();

  const unpaintedPixels = useCanvasStore((state) => state.unpaintedPixels);
  const energy = useCanvasStore((state) => state.energy);
  const maxEnergy = useCanvasStore((state) => state.maxEnergy);
  const lastEnergyUpdate = useCanvasStore((state) => state.lastEnergyUpdate);
  const recoverySpeed = useCanvasStore((state) => state.recoverySpeed);

  const { t } = useTranslation();

  const pixelsPainted = Object.keys(unpaintedPixels).length;

  const handleColorSelect = useCallback((color: string) => {
    useCanvasStore.getState().setSelectedColor(color);
  }, []);

  const handleClosePalette = useCallback(() => {
    setIsPaletteOpen(false);
    useCanvasStore.getState().clearUnpaintedPixels();
  }, []);

  const handleEraseToggle = useCallback(() => {
    setIsEraserActive((prev) => !prev);
  }, []);

  const handlePaintClick = useCallback(() => {
    if (!isPaletteOpen) {
      setIsPaletteOpen(true);
      return;
    }

    if (pixelsPainted === 0) {
      toast.warn(t("canvas.errors.place-pixel-required"));
      return;
    }

    setIsLoading(true);

    const userId = useAuthStore.getState().user?.id ?? "";
    const pixelsToSend: Omit<IPixel, "userId">[] = Object.entries(
      unpaintedPixels,
    ).map(([key, color]) => {
      const [xStr, yStr] = key.split(":");
      return { x: Number(xStr), y: Number(yStr), color: String(color) };
    });

    const localPixels: IPixel[] = pixelsToSend.map((p) => ({ ...p, userId }));

    getSocket().emit(
      "sendBatch",
      pixelsToSend,
      (err?: string, energyLeft?: number, maxEnergy?: number) => {
        setIsLoading(false);

        if (err) {
          toast.error(t(err));
          return;
        }

        const store = useCanvasStore.getState();
        store.setPixelsBatch(localPixels);
        store.clearUnpaintedPixels();
        playTapSound(tapSoundMp3);

        if (typeof energyLeft === "number") store.setEnergy(energyLeft);
        if (typeof maxEnergy === "number") store.setMaxEnergy(maxEnergy);

        useShopStore.getState().fetchShop(true);
      },
    );
  }, [isPaletteOpen, pixelsPainted, unpaintedPixels, t]);

  const handleClosePixelDetails = useCallback(() => setSelectedPixel(null), []);

  const undoLastPixel = useCallback(() => {
    useCanvasStore.getState().undoLastPixel();
  }, []);

  return {
    isPaletteOpen,
    setIsPaletteOpen,
    isLoading,
    isEraserActive,
    selectedPixel,
    setSelectedPixel,
    isHidden,
    toggleInterface,
    unpaintedPixels,
    pixelsPainted,
    energy,
    maxEnergy,
    lastEnergyUpdate,
    recoverySpeed,
    undoLastPixel,
    handleColorSelect,
    handleClosePalette,
    handleEraseToggle,
    handlePaintClick,
    handleClosePixelDetails,
  };
};

export { useCanvasView };
