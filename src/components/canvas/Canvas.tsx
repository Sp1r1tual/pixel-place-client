import { useEffect } from "react";

import { useCanvasRenderer } from "@/hooks/useCanvasRender";
import { useCanvasControls } from "@/hooks/useCanvasControls";

import { IPixel } from "@/types";

import styles from "./styles/Canvas.module.css";

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
    scale,
    setScale,
    position,
    setPosition,
    constrainPosition,
    centerCanvas,
    pixels,
    unpaintedPixels,
  } = useCanvasRenderer();

  const { handleMouseDown } = useCanvasControls({
    canvasRef,
    scale,
    setScale,
    position,
    setPosition,
    constrainPosition,
    isPaletteOpen,
    isEraserActive,
    pixels,
    unpaintedPixels,
    ...(onPixelClick !== undefined && { onPixelClick }),
  });

  useEffect(() => {
    centerCanvas();
  }, [centerCanvas]);

  return (
    <div ref={containerRef} className={styles.container}>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        className={styles.canvas}
      />
    </div>
  );
};

export { Canvas };
