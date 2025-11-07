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
  console.log("Canvas View");
  const {
    isPaletteOpen,
    isLoading,
    isEraserActive,
    selectedPixel,
    setSelectedPixel,
    isHidden,
    toggleInterface,
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

      {!isHidden && (
        <div
          className={`${styles.bottomContainer} ${
            isPaletteOpen ? styles.open : ""
          } `}
        >
          {isPaletteOpen && (
            <>
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
            </>
          )}
        </div>
      )}

      {!selectedPixel && (
        <div className={styles.paintBtnFixed}>
          <PrimaryBtn
            text={t("canvas.buttons.paint")}
            image={brushSvg}
            onClick={handlePaintClick}
            isLoading={isLoading}
            showTimer={true}
            timerData={{
              energy,
              maxEnergy,
              lastEnergyUpdate,
              recoverySpeed,
            }}
          />
        </div>
      )}
    </div>
  );
};

export { CanvasView };
