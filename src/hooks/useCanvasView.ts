import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

import { IPixel } from "@/types/canvas";

import { useAuthStore } from "@/store/useAuthStore";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useShopStore } from "@/store/useShopStore";
import { useUserInterface } from "@/store/useUserInterface";

import { getSocket } from "@/sockets/canvasSockets";

import tapSoundMp3 from "@/assets/sounds/key-hit-sound.mp3";

const useCanvasView = () => {
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEraserActive, setIsEraserActive] = useState(false);
  const [selectedPixel, setSelectedPixel] = useState<IPixel | null>(null);

  const { isHidden, toggleInterface } = useUserInterface();
  const {
    unpaintedPixels,
    setPixelsBatch,
    clearUnpaintedPixels,
    energy,
    maxEnergy,
    undoLastPixel,
  } = useCanvasStore();

  const { t } = useTranslation();

  const pixelsPainted = Object.keys(unpaintedPixels).length;

  const handleColorSelect = useCallback((color: string) => {
    useCanvasStore.getState().setSelectedColor(color);
  }, []);

  const handleClosePalette = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsPaletteOpen(false);
      setIsAnimating(false);
      clearUnpaintedPixels();
    }, 200);
  }, [clearUnpaintedPixels]);

  const handleEraseToggle = useCallback(() => {
    setIsEraserActive((prev) => !prev);
  }, []);

  const playTapSound = useCallback(() => {
    const audio = new Audio(tapSoundMp3);
    audio.volume = 1;
    audio.play().catch(() => {});
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
      return { x: Number(xStr), y: Number(yStr), color };
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

        setPixelsBatch(localPixels);
        clearUnpaintedPixels();
        playTapSound();

        if (typeof energyLeft === "number")
          useCanvasStore.getState().setEnergy(energyLeft);
        if (typeof maxEnergy === "number")
          useCanvasStore.getState().setMaxEnergy(maxEnergy);

        useShopStore.getState().fetchShop(true);
      },
    );
  }, [
    clearUnpaintedPixels,
    isPaletteOpen,
    pixelsPainted,
    playTapSound,
    setPixelsBatch,
    t,
    unpaintedPixels,
  ]);

  const handleClosePixelDetails = useCallback(() => setSelectedPixel(null), []);

  return {
    isPaletteOpen,
    setIsPaletteOpen,
    isAnimating,
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
    undoLastPixel,
    handleColorSelect,
    handleClosePalette,
    handleEraseToggle,
    handlePaintClick,
    handleClosePixelDetails,
  };
};

export { useCanvasView };
