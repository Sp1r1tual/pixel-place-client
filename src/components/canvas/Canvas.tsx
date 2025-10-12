import { Stage, Layer, Rect } from "react-konva";

import { useCanvas } from "@/hooks/useCanvas";

import styles from "./styles/Canvas.module.css";

const PIXEL_SIZE = 10;
const CANVAS_WIDTH = 100;
const CANVAS_HEIGHT = 100;

const Canvas = () => {
  const {
    stageRef,
    pixels,
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleWheel,
  } = useCanvas();

  const renderedPixels = Object.entries(pixels).map(([key, color]) => {
    const [xStr, yStr] = key.split(":");
    return (
      <Rect
        key={key}
        x={Number(xStr) * PIXEL_SIZE}
        y={Number(yStr) * PIXEL_SIZE}
        width={PIXEL_SIZE}
        height={PIXEL_SIZE}
        fill={color}
      />
    );
  });

  return (
    <div className={styles.canvasWrapper}>
      <div className={styles.canvasContainer}>
        <Stage
          ref={stageRef}
          width={CANVAS_WIDTH * PIXEL_SIZE}
          height={CANVAS_HEIGHT * PIXEL_SIZE}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={`${styles.canvasStage} ${isDragging ? styles.dragging : ""}`}
        >
          <Layer>{renderedPixels}</Layer>
        </Stage>
      </div>
    </div>
  );
};

export { Canvas };
