import { useEffect } from "react";

import { useCanvas } from "@/hooks/useCanvas";

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
  const { canvasRef, containerRef, handleMouseDown, centerCanvas } = useCanvas(
    isPaletteOpen,
    isEraserActive,
    onPixelClick,
  );

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
