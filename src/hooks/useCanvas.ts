import { useRef, useState, useCallback, useEffect } from "react";
import { KonvaEventObject } from "konva/lib/Node";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import Konva from "konva";

import { useCanvasStore } from "@/store/useCanvasStore";

import { IPixel } from "@/types";

import { CANVAS_DATA } from "@/data/canvas";

const useCanvas = (
  isPaletteOpen: boolean,
  isEraserActive: boolean,
  onPixelClick?: (pixel: IPixel) => void,
) => {
  const stageRef = useRef<Konva.Stage | null>(null);
  const isPinchingRef = useRef(false);
  const isDraggingRef = useRef(false);

  const [isDragging, setIsDragging] = useState(false);

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

  const pinchRef = useRef<{ startDist: number; startScale: number } | null>(
    null,
  );

  const { t } = useTranslation();

  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

  useEffect(() => {
    initSocket();
    return () => cleanupSocket();
  }, [initSocket, cleanupSocket]);

  const centerCanvas = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const container = stage.container();
    const stageWidth = container.offsetWidth;
    const stageHeight = container.offsetHeight;

    const canvasWidth = CANVAS_DATA.CANVAS_WIDTH * CANVAS_DATA.PIXEL_SIZE;
    const canvasHeight = CANVAS_DATA.CANVAS_HEIGHT * CANVAS_DATA.PIXEL_SIZE;

    const x = (stageWidth - canvasWidth) / 2;
    const y = (stageHeight - canvasHeight) / 2;

    stage.position({ x, y });
    stage.batchDraw();
  }, []);

  const getStageSize = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return { width: window.innerWidth, height: window.innerHeight };

    const container = stage.container();
    return {
      width: container.offsetWidth,
      height: container.offsetHeight,
    };
  }, []);

  const handleMouseUp = useCallback(() => {
    const stage = stageRef.current;
    if (!stage || !isDraggingRef.current) return;

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
          toast.warn(t("canvas.errors.cannot-erase-unsent"));
        }
      } else {
        addUnpaintedPixel(x, y, selectedColor);
      }
      return;
    }

    if (!isPaletteOpen && onPixelClick) {
      const key = `${x}:${y}`;
      const pixel = pixels[key];
      if (pixel) onPixelClick(pixel);
    }
  }, [
    isPaletteOpen,
    isEraserActive,
    addUnpaintedPixel,
    removeUnpaintedPixel,
    selectedColor,
    unpaintedPixels,
    pixels,
    onPixelClick,
    t,
  ]);

  const handleTouchEnd = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;

    if (isPinchingRef.current) {
      isPinchingRef.current = false;
      pinchRef.current = null;
      setIsDragging(false);
      return;
    }

    pinchRef.current = null;
    const state = dragStateRef.current;
    setIsDragging(false);

    if (state.distance <= CANVAS_DATA.DRAG_THRESHOLD && !state.hasMoved) {
      handleMouseUp();
    }
  }, [handleMouseUp]);

  const handleMouseMove = useCallback(() => {
    const stage = stageRef.current;
    if (!stage || !isDraggingRef.current) return;

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
      const { width: stageWidth, height: stageHeight } = getStageSize();
      const scaledWidth =
        CANVAS_DATA.CANVAS_WIDTH * CANVAS_DATA.PIXEL_SIZE * scale;
      const scaledHeight =
        CANVAS_DATA.CANVAS_HEIGHT * CANVAS_DATA.PIXEL_SIZE * scale;
      const minX = Math.min(0, stageWidth - scaledWidth);
      const maxX = 0;
      const minY = Math.min(0, stageHeight - scaledHeight);
      const maxY = 0;

      stage.x(Math.max(minX, Math.min(maxX, newX)));
      stage.y(Math.max(minY, Math.min(maxY, newY)));
    }
  }, [getStageSize]);

  const handleMouseDown = useCallback((e: KonvaEventObject<MouseEvent>) => {
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
  }, []);

  const handleTouchStart = useCallback((e: KonvaEventObject<TouchEvent>) => {
    const stage = stageRef.current;
    if (!stage) return;

    e.evt.preventDefault();

    if (e.evt.touches.length === 2) {
      setIsDragging(false);
      isPinchingRef.current = true;
      const [touch1, touch2] = e.evt.touches;
      if (!touch1 || !touch2) return;

      const dist = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY,
      );
      pinchRef.current = { startDist: dist, startScale: stage.scaleX() };
      return;
    }

    if (e.evt.touches.length === 1) {
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
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: KonvaEventObject<TouchEvent>) => {
      const stage = stageRef.current;
      if (!stage) return;

      if (e.evt.touches.length === 2 && pinchRef.current) {
        const [touch1, touch2] = e.evt.touches;
        if (!touch1 || !touch2) return;

        e.evt.preventDefault();
        const dist = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY,
        );

        const newScale =
          (dist / pinchRef.current.startDist) * pinchRef.current.startScale;
        const limitedScale = Math.max(
          CANVAS_DATA.MIN_SCALE,
          Math.min(newScale, CANVAS_DATA.MAX_SCALE),
        );

        const pointer = {
          x: (touch1.clientX + touch2.clientX) / 2,
          y: (touch1.clientY + touch2.clientY) / 2,
        };

        const mousePointTo = {
          x: (pointer.x - stage.x()) / stage.scaleX(),
          y: (pointer.y - stage.y()) / stage.scaleY(),
        };

        stage.scale({ x: limitedScale, y: limitedScale });

        const { width: stageWidth, height: stageHeight } = getStageSize();
        const scaledWidth =
          CANVAS_DATA.CANVAS_WIDTH * CANVAS_DATA.PIXEL_SIZE * limitedScale;
        const scaledHeight =
          CANVAS_DATA.CANVAS_HEIGHT * CANVAS_DATA.PIXEL_SIZE * limitedScale;
        const minX = Math.min(0, stageWidth - scaledWidth);
        const maxX = 0;
        const minY = Math.min(0, stageHeight - scaledHeight);
        const maxY = 0;

        const newX = pointer.x - mousePointTo.x * limitedScale;
        const newY = pointer.y - mousePointTo.y * limitedScale;

        stage.position({
          x: Math.max(minX, Math.min(maxX, newX)),
          y: Math.max(minY, Math.min(maxY, newY)),
        });

        stage.batchDraw();
        return;
      }

      if (isDraggingRef.current) {
        e.evt.preventDefault();
        handleMouseMove();
      }
    },
    [handleMouseMove, getStageSize],
  );

  const handleWheel = useCallback(
    (e: KonvaEventObject<WheelEvent>) => {
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
      const newScale =
        e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
      const limitedScale = Math.max(
        CANVAS_DATA.MIN_SCALE,
        Math.min(newScale, CANVAS_DATA.MAX_SCALE),
      );

      stage.scale({ x: limitedScale, y: limitedScale });

      const newPos = {
        x: pointer.x - mousePointTo.x * limitedScale,
        y: pointer.y - mousePointTo.y * limitedScale,
      };
      const { width: stageWidth, height: stageHeight } = getStageSize();
      const scaledWidth =
        CANVAS_DATA.CANVAS_WIDTH * CANVAS_DATA.PIXEL_SIZE * limitedScale;
      const scaledHeight =
        CANVAS_DATA.CANVAS_HEIGHT * CANVAS_DATA.PIXEL_SIZE * limitedScale;
      const minX = Math.min(0, stageWidth - scaledWidth);
      const maxX = 0;
      const minY = Math.min(0, stageHeight - scaledHeight);
      const maxY = 0;

      stage.position({
        x: Math.max(minX, Math.min(maxX, newPos.x)),
        y: Math.max(minY, Math.min(maxY, newPos.y)),
      });
    },
    [getStageSize],
  );

  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleMouseUp, handleTouchEnd]);

  return {
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
  };
};

export { useCanvas };
