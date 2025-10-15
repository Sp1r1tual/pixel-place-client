import { useEffect, useRef, useState, useCallback } from "react";
import { KonvaEventObject } from "konva/lib/Node";
import { toast } from "react-toastify";
import Konva from "konva";

import { IPixel } from "@/types";

import { useCanvasStore } from "@/store/useCanvasStore";

import { CANVAS_DATA } from "@/data/canvas";

const useCanvas = (
  isPaletteOpen: boolean,
  isEraserActive: boolean,
  onPixelClick?: (pixel: IPixel) => void,
) => {
  const stageRef = useRef<Konva.Stage | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [stageSize, setStageSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const {
    pixels,
    unpaintedPixels,
    addUnpaintedPixel,
    removeUnpaintedPixel,
    selectedColor,
    initSocket,
    cleanupSocket,
  } = useCanvasStore();

  const dragStateRef = useRef({
    startX: 0,
    startY: 0,
    stageStartX: 0,
    stageStartY: 0,
    distance: 0,
    hasMoved: false,
  });

  useEffect(() => {
    const handleResize = () =>
      setStageSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    initSocket();
    return () => cleanupSocket();
  }, [initSocket, cleanupSocket]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const canvasWidth = CANVAS_DATA.CANVAS_WIDTH * CANVAS_DATA.PIXEL_SIZE;
    const canvasHeight = CANVAS_DATA.CANVAS_HEIGHT * CANVAS_DATA.PIXEL_SIZE;

    const x = (window.innerWidth - canvasWidth) / 2;
    const y = (window.innerHeight - canvasHeight) / 2;

    stage.position({ x, y });
    stage.batchDraw();
  }, []);

  const handleMouseUp = useCallback(() => {
    const stage = stageRef.current;
    if (!stage || !isDragging) return;

    const state = dragStateRef.current;
    setIsDragging(false);

    if (state.distance > CANVAS_DATA.DRAG_THRESHOLD || state.hasMoved) return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const scale = stage.scaleX();
    const stageX = stage.x();
    const stageY = stage.y();

    const x = Math.floor(
      (pointer.x - stageX) / (CANVAS_DATA.PIXEL_SIZE * scale),
    );
    const y = Math.floor(
      (pointer.y - stageY) / (CANVAS_DATA.PIXEL_SIZE * scale),
    );

    const isInsideBounds =
      x >= 0 &&
      y >= 0 &&
      x < CANVAS_DATA.CANVAS_WIDTH &&
      y < CANVAS_DATA.CANVAS_HEIGHT;
    if (!isInsideBounds) return;

    if (isPaletteOpen) {
      if (isEraserActive) {
        const key = `${x}:${y}`;
        if (unpaintedPixels[key]) {
          removeUnpaintedPixel(x, y);
        } else {
          toast.warn("You can erase only unsent pixels");
        }
      } else {
        addUnpaintedPixel(x, y, selectedColor);
      }
      return;
    }

    if (!isPaletteOpen && onPixelClick) {
      const key = `${x}:${y}`;
      const pixel = pixels[key];
      if (pixel) {
        onPixelClick(pixel);
      }
    }
  }, [
    isDragging,
    isPaletteOpen,
    isEraserActive,
    addUnpaintedPixel,
    removeUnpaintedPixel,
    selectedColor,
    unpaintedPixels,
    pixels,
    onPixelClick,
  ]);

  const handleTouchEnd = useCallback(() => setIsDragging(false), []);

  useEffect(() => {
    const handleWindowMouseUp = () => handleMouseUp();
    const handleWindowTouchEnd = () => handleTouchEnd();
    window.addEventListener("mouseup", handleWindowMouseUp);
    window.addEventListener("touchend", handleWindowTouchEnd);
    return () => {
      window.removeEventListener("mouseup", handleWindowMouseUp);
      window.removeEventListener("touchend", handleWindowTouchEnd);
    };
  }, [handleMouseUp, handleTouchEnd]);

  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    const stage = stageRef.current;
    if (!stage || (e.evt.button !== 0 && e.evt.button !== 1)) return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    setIsDragging(true);
    dragStateRef.current = {
      startX: pointer.x,
      startY: pointer.y,
      stageStartX: stage.x(),
      stageStartY: stage.y(),
      distance: 0,
      hasMoved: false,
    };
  };

  const handleMouseMove = () => {
    const stage = stageRef.current;
    if (!stage || !isDragging) return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const state = dragStateRef.current;
    const dx = pointer.x - state.startX;
    const dy = pointer.y - state.startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    state.distance = distance;

    if (distance > CANVAS_DATA.DRAG_THRESHOLD) {
      state.hasMoved = true;
      const scale = stage.scaleX();
      const newX = state.stageStartX + dx;
      const newY = state.stageStartY + dy;
      const scaledWidth =
        CANVAS_DATA.CANVAS_WIDTH * CANVAS_DATA.PIXEL_SIZE * scale;
      const scaledHeight =
        CANVAS_DATA.CANVAS_HEIGHT * CANVAS_DATA.PIXEL_SIZE * scale;
      const minX = Math.min(0, stageSize.width - scaledWidth);
      const maxX = 0;
      const minY = Math.min(0, stageSize.height - scaledHeight);
      const maxY = 0;

      stage.x(Math.max(minX, Math.min(maxX, newX)));
      stage.y(Math.max(minY, Math.min(maxY, newY)));
    }
  };

  const handleTouchStart = (e: KonvaEventObject<TouchEvent>) => {
    const stage = stageRef.current;
    if (!stage || e.evt.touches.length !== 2) return;

    e.evt.preventDefault();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    setIsDragging(true);
    dragStateRef.current = {
      startX: pointer.x,
      startY: pointer.y,
      stageStartX: stage.x(),
      stageStartY: stage.y(),
      distance: 0,
      hasMoved: false,
    };
  };

  const handleTouchMove = (e: KonvaEventObject<TouchEvent>) => {
    const stage = stageRef.current;
    if (!stage || !isDragging || e.evt.touches.length !== 2) return;

    e.evt.preventDefault();
    handleMouseMove();
  };

  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    const stage = stageRef.current;
    if (!stage) return;

    e.evt.preventDefault();
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    const scaleBy = 1.1;
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    const limitedScale = Math.max(
      CANVAS_DATA.MIN_SCALE,
      Math.min(newScale, CANVAS_DATA.MAX_SCALE),
    );

    stage.scale({ x: limitedScale, y: limitedScale });

    const newPos = {
      x: pointer.x - mousePointTo.x * limitedScale,
      y: pointer.y - mousePointTo.y * limitedScale,
    };
    const scaledWidth =
      CANVAS_DATA.CANVAS_WIDTH * CANVAS_DATA.PIXEL_SIZE * limitedScale;
    const scaledHeight =
      CANVAS_DATA.CANVAS_HEIGHT * CANVAS_DATA.PIXEL_SIZE * limitedScale;
    const minX = Math.min(0, stageSize.width - scaledWidth);
    const maxX = 0;
    const minY = Math.min(0, stageSize.height - scaledHeight);
    const maxY = 0;

    stage.position({
      x: Math.max(minX, Math.min(maxX, newPos.x)),
      y: Math.max(minY, Math.min(maxY, newPos.y)),
    });
  };

  return {
    stageRef,
    pixels,
    unpaintedPixels,
    stageSize,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleWheel,
  };
};

export { useCanvas };
