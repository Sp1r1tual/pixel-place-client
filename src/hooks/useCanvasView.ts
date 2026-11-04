import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

import { IPixel } from "@/types/canvas";

import { useCanvasStore } from "@/store/useCanvasStore";
import { useShopStore } from "@/store/useShopStore";
import { useUserInterface } from "@/store/useUserInterface";

import { getSocket } from "@/sockets/canvasSockets";

import { playTapSound } from "@/utils/sfx/playTapSound";

import tapSoundMp3 from "@/assets/sounds/key-hit-sound.mp3";

const SEND_BATCH_TIMEOUT_MS = 15000;

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

    const socket = getSocket();

    if (!socket.connected) {
      toast.warn(t("socket.connection-lost"));
      return;
    }

    setIsLoading(true);

    const pixelsToSend = Object.entries(unpaintedPixels).map(([key, color]) => {
      const [xStr, yStr] = key.split(":");
      return { x: Number(xStr), y: Number(yStr), color };
    });

    socket
      .timeout(SEND_BATCH_TIMEOUT_MS)
      .emit(
        "sendBatch",
        pixelsToSend,
        (timeoutError: Error | null, err?: string) => {
          setIsLoading(false);

          if (timeoutError) {
            toast.error(t("socket.connection-lost"));
            return;
          }

          if (err) {
            toast.error(t(err));
            return;
          }

          // The pixels and new energy arrive through updatePixels and energyUpdate.
          useCanvasStore.getState().clearUnpaintedPixels();
          playTapSound(tapSoundMp3);
          useShopStore.getState().fetchShop(true, true);
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
