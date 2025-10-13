import { useState } from "react";

import { useCanvasStore } from "@/store/useCanvasStore";

import { Canvas } from "./Canvas";
import { PrimaryBtn } from "../ui/PrimaryBtn";
import { Palette } from "./Palette";
import { CloseBtn } from "../ui/CloseBtn";

import { getSocket } from "@/sockets/canvasSockets";
import brushSvg from "@/assets/brush-3-svgrepo-com.svg";

import styles from "./styles/CanvasView.module.css";

const CanvasView = () => {
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { unpaintedPixels, setPixelsBatch, clearUnpaintedPixels } =
    useCanvasStore();

  const pixelsPainted = Object.keys(unpaintedPixels).length;

  const handleColorSelect = (color: string) => {
    useCanvasStore.getState().setSelectedColor(color);
  };

  const handleClose = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsPaletteOpen(false);
      setIsAnimating(false);
      clearUnpaintedPixels();
    }, 200);
  };

  const handlePaintClick = async () => {
    if (!isPaletteOpen) {
      setIsPaletteOpen(true);
    } else {
      if (pixelsPainted === 0) return;

      setIsLoading(true);

      const pixelsToSend = Object.entries(unpaintedPixels).map(
        ([key, color]) => {
          const [xStr, yStr] = key.split(":");
          return { x: Number(xStr), y: Number(yStr), color };
        },
      );

      getSocket().emit("sendBatch", pixelsToSend, (err?: string) => {
        if (err) {
          console.error("[socket] Pixel error:", err);

          setIsLoading(false);
        } else {
          setPixelsBatch(pixelsToSend);
          clearUnpaintedPixels();
          setIsLoading(false);
        }
      });
    }
  };

  return (
    <div className={styles.canvasView}>
      <Canvas isPaletteOpen={isPaletteOpen} />
      {isPaletteOpen && (
        <div
          className={`${styles.bottomContainer} ${isAnimating ? styles.closing : ""}`}
        >
          <div className={styles.topRow}>
            <span className={styles.paintPixels}>
              Paint pixels: {pixelsPainted}
            </span>
            <CloseBtn onClick={handleClose} />
          </div>
          <div className={styles.paletteWrapper}>
            <Palette onSelectColor={handleColorSelect} />
          </div>
          <div className={styles.btnWrapper}>
            <PrimaryBtn
              text="Paint"
              image={brushSvg}
              onClick={handlePaintClick}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}
      {!isPaletteOpen && (
        <div
          className={styles.btnWrapper}
          style={{
            position: "absolute",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <PrimaryBtn
            text="Paint"
            image={brushSvg}
            onClick={handlePaintClick}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
};

export { CanvasView };
