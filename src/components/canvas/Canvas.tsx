import { Stage, Layer, Rect } from "react-konva";

import { useCanvas } from "@/hooks/useCanvas";

import { CANVAS_DATA } from "@/data/canvas";

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
    const x = Number(xStr);
    const y = Number(yStr);
    return (
      <Rect
        key={key}
        x={x * CANVAS_DATA.PIXEL_SIZE}
        y={y * CANVAS_DATA.PIXEL_SIZE}
        width={CANVAS_DATA.PIXEL_SIZE}
        height={CANVAS_DATA.PIXEL_SIZE}
        fill={color}
      />
    );
  });

  const canvasWidth = CANVAS_DATA.CANVAS_WIDTH * CANVAS_DATA.PIXEL_SIZE;
  const canvasHeight = CANVAS_DATA.CANVAS_HEIGHT * CANVAS_DATA.PIXEL_SIZE;

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
        <Layer
          x={0}
          y={0}
          clipX={0}
          clipY={0}
          clipWidth={canvasWidth}
          clipHeight={canvasHeight}
        >
          <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} />
          {renderedPixels}
        </Layer>

        <Layer>
          <Rect
            x={0}
            y={0}
            width={canvasWidth}
            height={canvasHeight}
            stroke="#888888"
            strokeWidth={3}
            listening={false}
            shadowColor="#000000"
            shadowBlur={4}
          />
        </Layer>
      </Stage>
    </div>
  );
};

export { Canvas };
