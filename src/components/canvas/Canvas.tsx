import { useEffect } from "react";

import { useCanvas } from "@/hooks/useCanvas";

import { IPixel } from "@/types";

interface ICanvasProps {
  isPaletteOpen: boolean;
  isEraserActive: boolean;
  onPixelClick?: (pixel: IPixel) => void;
}

const Canvas = ({
  isPaletteOpen,
  isEraserActive,
  onPixelClick,
}: ICanvasProps) => {
  const {
    canvasRef,
    containerRef,
    handleMouseDown,
    handleTouchStart,
    handleTouchMove,
    handleWheel,
    centerCanvas,
  } = useCanvas(isPaletteOpen, isEraserActive, onPixelClick);

  useEffect(() => {
    centerCanvas();
  }, [centerCanvas]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        style={{
          display: "block",
          touchAction: "none",
        }}
      />
    </div>
  );
};

export { Canvas };
