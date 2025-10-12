import { useState } from "react";

import { useCanvasStore } from "@/store/useCanvasStore";

import { Canvas } from "./Canvas";
import { PrimaryBtn } from "../ui/PrimaryBtn";
import { Palette } from "./Palette";
import { CloseBtn } from "../ui/CloseBtn";

import brushSvg from "@/assets/brush-3-svgrepo-com.svg";

import styles from "./styles/CanvasView.module.css";

const CanvasView = () => {
  const pixelsPainted = 5;

  const [isPaletteOpen, setIsPaletteOpen] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleColorSelect = (color: string) => {
    console.log("Selected color:", color);
    useCanvasStore.getState().setSelectedColor(color);
  };

  const handleClose = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsPaletteOpen(false);
      setIsAnimating(false);
    }, 200);
  };

  const handlePaintClick = () => {
    if (!isPaletteOpen) {
      setIsPaletteOpen(true);
    } else {
      console.log("Brush clicked");
    }
  };

  return (
    <div className={styles.canvasView}>
      <Canvas />

      {isPaletteOpen && (
        <div
          className={`${styles.bottomContainer} ${
            isAnimating ? styles.closing : ""
          }`}
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
              isLoading={false}
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
            isLoading={false}
          />
        </div>
      )}
    </div>
  );
};

export { CanvasView };
