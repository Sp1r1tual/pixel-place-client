import { useEffect, useRef, useState, useCallback } from "react";
import { KonvaEventObject } from "konva/lib/Node";
import Konva from "konva";

import { useCanvasStore } from "@/store/useCanvasStore";

import { getSocket } from "@/sockets/canvasSockets";

const PIXEL_SIZE = 10;
const DRAG_THRESHOLD = 5;
const MIN_SCALE = 0.5;
const MAX_SCALE = 5;

const useCanvas = () => {
  const { pixels, setPixel, initSocket, cleanupSocket } = useCanvasStore();
  const stageRef = useRef<Konva.Stage | null>(null);

  const [isDragging, setIsDragging] = useState(false);

  const dragStateRef = useRef({
    startX: 0,
    startY: 0,
    stageStartX: 0,
    stageStartY: 0,
    distance: 0,
    hasMoved: false,
  });

  useEffect(() => {
    initSocket();
    return () => cleanupSocket();
  }, [initSocket, cleanupSocket]);

  const handleMouseUp = useCallback(() => {
    const stage = stageRef.current;
    if (!stage || !isDragging) return;

    const state = dragStateRef.current;

    if (state.distance <= DRAG_THRESHOLD && !state.hasMoved) {
      const pointer = stage.getPointerPosition();
      if (pointer) {
        const scale = stage.scaleX();
        const stageX = stage.x();
        const stageY = stage.y();

        const x = Math.floor((pointer.x - stageX) / (PIXEL_SIZE * scale));
        const y = Math.floor((pointer.y - stageY) / (PIXEL_SIZE * scale));
        const color = "#000000";

        setPixel(x, y, color);
        getSocket().emit("sendBatch", [{ x, y, color }]);
      }
    }

    setIsDragging(false);
  }, [isDragging, setPixel]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    const handleWindowMouseUp = () => {
      handleMouseUp();
    };

    const handleWindowTouchEnd = () => {
      handleTouchEnd();
    };

    window.addEventListener("mouseup", handleWindowMouseUp);
    window.addEventListener("touchend", handleWindowTouchEnd);

    return () => {
      window.removeEventListener("mouseup", handleWindowMouseUp);
      window.removeEventListener("touchend", handleWindowTouchEnd);
    };
  }, [handleMouseUp, handleTouchEnd]);

  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    const stage = stageRef.current;
    if (!stage) return;

    if (e.evt.button === 0 || e.evt.button === 1) {
      const pointer = stage.getPointerPosition();
      if (pointer) {
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
    }
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

    if (distance > DRAG_THRESHOLD) {
      state.hasMoved = true;
      stage.x(state.stageStartX + dx);
      stage.y(state.stageStartY + dy);
    }
  };

  const handleTouchStart = (e: KonvaEventObject<TouchEvent>) => {
    const stage = stageRef.current;
    if (!stage || e.evt.touches.length !== 2) return;

    e.evt.preventDefault();
    const pointer = stage.getPointerPosition();
    if (pointer) {
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
  };

  const handleTouchMove = (e: KonvaEventObject<TouchEvent>) => {
    const stage = stageRef.current;
    if (!stage || !isDragging || e.evt.touches.length !== 2) return;

    e.evt.preventDefault();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const state = dragStateRef.current;
    const dx = pointer.x - state.startX;
    const dy = pointer.y - state.startY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    state.distance = distance;

    if (distance > DRAG_THRESHOLD) {
      state.hasMoved = true;
      stage.x(state.stageStartX + dx);
      stage.y(state.stageStartY + dy);
    }
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
    const limitedScale = Math.max(MIN_SCALE, Math.min(newScale, MAX_SCALE));

    stage.scale({ x: limitedScale, y: limitedScale });

    const newPos = {
      x: pointer.x - mousePointTo.x * limitedScale,
      y: pointer.y - mousePointTo.y * limitedScale,
    };

    stage.position(newPos);
  };

  return {
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
  };
};

export { useCanvas };
