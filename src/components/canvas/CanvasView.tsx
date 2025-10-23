import { useTranslation } from "react-i18next";

import { useCanvasView } from "@/hooks/useCanvasView";

import { Canvas } from "./Canvas";
import { PixelDetails } from "./PixelDetails";
import { PrimaryBtn } from "../ui/PrimaryBtn";
import { Palette } from "./Palette";
import { InterfaceBtn } from "../ui/InterfaceBtn";
import { CloseBtn } from "../ui/CloseBtn";

import brushSvg from "@/assets/brush-3-svgrepo-com.svg";
import hideInterfaceSvg from "@/assets/eye-slash-visibility-visible-hide-hidden-show-watch-svgrepo-com.svg";
import showIntrfaceSvg from "@/assets/eye-visibility-visible-hide-hidden-show-watch-svgrepo-com.svg";
import eraseSvg from "@/assets/erase-svgrepo-com.svg";
import eraseActiveSvg from "@/assets/erase-active-svgrepo-com.svg";
import undoSvg from "@/assets/undo-svgrepo-com.svg";

import styles from "./styles/CanvasView.module.css";

const CanvasView = () => {
  const {
    isPaletteOpen,
    isAnimating,
    isLoading,
    isEraserActive,
    selectedPixel,
    setSelectedPixel,
    isHidden,
    toggleInterface,
    pixelsPainted,
    energy,
    maxEnergy,
    undoLastPixel,
    handleColorSelect,
    handleClosePalette,
    handleEraseToggle,
    handlePaintClick,
    handleClosePixelDetails,
  } = useCanvasView();

  const { t } = useTranslation();

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
                isActive={isHidden}
              />
              <InterfaceBtn
                id="EraseBtn"
                imgDefault={eraseSvg}
                imgActive={eraseActiveSvg}
                onClick={handleEraseToggle}
                isActive={isEraserActive}
              />
            </div>

            <span className={styles.paintPixels}>
              {t("canvas.painted")} {pixelsPainted}
            </span>

            <div className={styles.uiBtnWrapper}>
              <InterfaceBtn
                id="undoPixelBtn"
                imgDefault={undoSvg}
                onClick={undoLastPixel}
              />
              <CloseBtn onClick={handleClosePalette} />
            </div>
          </div>

          <div className={styles.paletteWrapper}>
            <Palette onSelectColor={handleColorSelect} />
          </div>

          <div className={styles.btnWrapper}>
            {!selectedPixel && (
              <PrimaryBtn
                text={t("canvas.buttons.paint")}
                progressCurrent={energy}
                progressFull={maxEnergy}
                image={brushSvg}
                onClick={handlePaintClick}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      )}

      {!isPaletteOpen && !selectedPixel && (
        <div
          className={styles.btnWrapper}
          style={{
            position: "absolute",
            bottom: "calc(env(safe-area-inset-bottom, 0) + 20px)",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <PrimaryBtn
            text={t("canvas.buttons.paint")}
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
