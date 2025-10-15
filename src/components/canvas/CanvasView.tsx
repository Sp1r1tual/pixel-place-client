import { useState } from "react";

import { useCanvasStore } from "@/store/useCanvasStore";
import { useUserInterface } from "@/store/useUserInterface";

import { IPixel } from "@/types/canvas";

import { Canvas } from "./Canvas";
import { PixelDetails } from "./PixelDetails";
import { PrimaryBtn } from "../ui/PrimaryBtn";
import { Palette } from "./Palette";
import { InterfaceBtn } from "../ui/InterfaceBtn";
import { CloseBtn } from "../ui/CloseBtn";

import { getSocket } from "@/sockets/canvasSockets";

import brushSvg from "@/assets/brush-3-svgrepo-com.svg";
import hideInterfaceSvg from "@/assets/eye-slash-visibility-visible-hide-hidden-show-watch-svgrepo-com.svg";
import showIntrfaceSvg from "@/assets/eye-visibility-visible-hide-hidden-show-watch-svgrepo-com.svg";
import eraseSvg from "@/assets/erase-svgrepo-com.svg";
import eraseActiveSvg from "@/assets/erase-active-svgrepo-com.svg";

import styles from "./styles/CanvasView.module.css";

const CanvasView = () => {
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
  } = useCanvasStore();

  const pixelsPainted = Object.keys(unpaintedPixels).length;

  const handleColorSelect = (color: string) => {
    useCanvasStore.getState().setSelectedColor(color);
  };

  const handleClosePalette = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsPaletteOpen(false);
      setIsAnimating(false);
      clearUnpaintedPixels();
    }, 200);
  };

  const handleEraseToggle = () => {
    setIsEraserActive((prev) => !prev);
  };

  const handlePaintClick = async () => {
    if (!isPaletteOpen) {
      setIsPaletteOpen(true);
      return;
    }

    if (pixelsPainted === 0) return;

    setIsLoading(true);

    const pixelsToSend = Object.entries(unpaintedPixels).map(([key, color]) => {
      const [xStr, yStr] = key.split(":");
      return { x: Number(xStr), y: Number(yStr), color };
    });

    getSocket().emit(
      "sendBatch",
      pixelsToSend,
      (err?: string, energyLeft?: number, maxEnergy?: number) => {
        if (err) {
          console.error("[socket] Pixel error:", err);
          setIsLoading(false);
          return;
        }

        setPixelsBatch(pixelsToSend);
        clearUnpaintedPixels();

        if (typeof energyLeft === "number")
          useCanvasStore.getState().setEnergy(energyLeft);
        if (typeof maxEnergy === "number")
          useCanvasStore.getState().setMaxEnergy(maxEnergy);

        setIsLoading(false);
      },
    );
  };

  const handleClosePixelDetails = () => setSelectedPixel(null);

  return (
    <div className={styles.canvasView}>
      <Canvas
        isPaletteOpen={isPaletteOpen}
        isEraserActive={isEraserActive}
        onPixelClick={setSelectedPixel}
      />

      {selectedPixel && (
        <div className={styles.pixelDetailsOverlay}>
          <PixelDetails
            pixel={selectedPixel}
            onClose={handleClosePixelDetails}
          />
        </div>
      )}

      {!isHidden && isPaletteOpen && (
        <div
          className={`${styles.bottomContainer} ${
            isAnimating ? styles.closing : ""
          }`}
        >
          <div className={styles.topRow}>
            <div className={styles.uiBtnWrapper}>
              <InterfaceBtn
                id="hideInterfaceBtn"
                imgDefault={hideInterfaceSvg}
                imgActive={showIntrfaceSvg}
                onClick={toggleInterface}
              />
              <InterfaceBtn
                id="EraseBtn"
                imgDefault={eraseSvg}
                imgActive={eraseActiveSvg}
                onClick={handleEraseToggle}
              />
            </div>

            <span className={styles.paintPixels}>
              Paint pixels: {pixelsPainted}
            </span>

            <CloseBtn onClick={handleClosePalette} />
          </div>

          <div className={styles.paletteWrapper}>
            <Palette onSelectColor={handleColorSelect} />
          </div>

          <div className={styles.btnWrapper}>
            <PrimaryBtn
              text="Paint"
              progressCurrent={energy}
              progressFull={maxEnergy}
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
            progressCurrent={energy}
            progressFull={maxEnergy}
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
