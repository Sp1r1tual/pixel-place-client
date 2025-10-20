import { useEffect } from "react";
import { Stage, Layer, Rect } from "react-konva";

import { useCanvas } from "@/hooks/useCanvas";

import { IPixel } from "@/types";

import { CANVAS_DATA } from "@/data/canvas";

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
    stageRef,
    pixels,
    unpaintedPixels,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleWheel,
    centerCanvas,
  } = useCanvas(isPaletteOpen, isEraserActive, onPixelClick);

  useEffect(() => {
    centerCanvas();
  }, [centerCanvas]);

  const renderedPixels = Object.entries(pixels).map(([key, pixel]) => {
    const xPos = Math.round(pixel.x * CANVAS_DATA.PIXEL_SIZE);
    const yPos = Math.round(pixel.y * CANVAS_DATA.PIXEL_SIZE);
    const size = Math.round(CANVAS_DATA.PIXEL_SIZE) + 0.1;
    return (
      <Rect
        key={key}
        x={xPos}
        y={yPos}
        width={size}
        height={size}
        fill={pixel.color}
        strokeWidth={0}
      />
    );
  });

  const renderedUnpaintedPixels = Object.entries(unpaintedPixels).map(
    ([key, color]) => {
      const [xStr, yStr] = key.split(":");
      const x = Number(xStr);
      const y = Number(yStr);
      const xPos = Math.round(x * CANVAS_DATA.PIXEL_SIZE);
      const yPos = Math.round(y * CANVAS_DATA.PIXEL_SIZE);
      const size = Math.round(CANVAS_DATA.PIXEL_SIZE) + 0.1;
      return (
        <Rect
          key={`unpainted-${key}`}
          x={xPos}
          y={yPos}
          width={size}
          height={size}
          fill={color}
          stroke="#ffffffff"
          strokeWidth={1}
        />
      );
    },
  );

  const canvasWidth = CANVAS_DATA.CANVAS_WIDTH * CANVAS_DATA.PIXEL_SIZE;
  const canvasHeight = CANVAS_DATA.CANVAS_HEIGHT * CANVAS_DATA.PIXEL_SIZE;

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={window.innerHeight}
        style={{ width: "100%", height: "100%" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Layer
          x={0}
          y={0}
          clipX={0}
          clipY={0}
          clipWidth={canvasWidth}
          clipHeight={canvasHeight}
          perfectDrawEnabled={true}
        >
          <Rect
            x={0}
            y={0}
            width={canvasWidth}
            height={canvasHeight}
            fill="#fff"
          />
          {renderedPixels}
          {renderedUnpaintedPixels}
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
