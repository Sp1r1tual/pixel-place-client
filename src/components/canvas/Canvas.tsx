import { Stage, Layer, Rect } from "react-konva";

import { useCanvas } from "@/hooks/useCanvas";

import styles from "./styles/Canvas.module.css";

const Canvas = () => {
  const {
    stageRef,
    pixels,
    stageSize,
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
        x={Number(xStr) * 10}
        y={Number(yStr) * 10}
        width={10}
        height={10}
        fill={color}
      />
    );
  });

  return (
    <div className={styles.canvasWrapper}>
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
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
  );
};

export { Canvas };
