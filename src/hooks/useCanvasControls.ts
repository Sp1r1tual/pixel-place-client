import { useRef, useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { useCanvasStore } from "@/store/useCanvasStore";

import { IPixel } from "@/types";
import { CANVAS_DATA } from "@/data/canvas";

interface IDragState {
  startX: number;
  startY: number;
  stageStartX: number;
  stageStartY: number;
  distance: number;
  hasMoved: boolean;
  clientX?: number;
  clientY?: number;
}

interface IUseCanvasControlsProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  scale: number;
  setScale: (scale: number) => void;
  position: { x: number; y: number };
  setPosition: (position: { x: number; y: number }) => void;
  constrainPosition: (
    newX: number,
    newY: number,
    currentScale: number,
  ) => { x: number; y: number };
  isPaletteOpen: boolean;
  isEraserActive: boolean;
  pixels: Record<string, IPixel>;
  unpaintedPixels: Record<string, string>;
  onPixelClick?: (pixel: IPixel) => void;
}

const useCanvasControls = ({
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
  onPixelClick,
}: IUseCanvasControlsProps) => {
  const isPinchingRef = useRef(false);
  const isDraggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  const { addUnpaintedPixel, removeUnpaintedPixel, selectedColor } =
    useCanvasStore();

  const dragStateRef = useRef<IDragState>({
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

  const getCanvasCoordinates = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();
      const x = Math.floor(
        (clientX - rect.left - position.x) / (CANVAS_DATA.PIXEL_SIZE * scale),
      );
      const y = Math.floor(
        (clientY - rect.top - position.y) / (CANVAS_DATA.PIXEL_SIZE * scale),
      );

      return { x, y };
    },
    [canvasRef, position, scale],
  );

  const handleClick = useCallback(
    (clientX: number, clientY: number) => {
      const coords = getCanvasCoordinates(clientX, clientY);
      if (!coords) return;

      const { x, y } = coords;
      const isInside =
        x >= 0 &&
        y >= 0 &&
        x < CANVAS_DATA.CANVAS_WIDTH &&
        y < CANVAS_DATA.CANVAS_HEIGHT;

      if (!isInside) return;

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
    },
    [
      isPaletteOpen,
      isEraserActive,
      addUnpaintedPixel,
      removeUnpaintedPixel,
      selectedColor,
      unpaintedPixels,
      pixels,
      onPixelClick,
      getCanvasCoordinates,
      t,
    ],
  );

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.closest('button, [role="button"], .ui-element')) {
        setIsDragging(false);
        return;
      }

      if (!isDraggingRef.current) return;

      const state = dragStateRef.current;
      setIsDragging(false);

      if (state.distance > CANVAS_DATA.DRAG_THRESHOLD || state.hasMoved) return;

      handleClick(e.clientX, e.clientY);
    },
    [handleClick],
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.closest('button, [role="button"], .ui-element')) {
        isPinchingRef.current = false;
        pinchRef.current = null;
        setIsDragging(false);
        return;
      }

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
        if (state.clientX !== undefined && state.clientY !== undefined) {
          handleClick(state.clientX, state.clientY);
        }
      }
    },
    [handleClick],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingRef.current) return;

      const state = dragStateRef.current;
      const dx = e.clientX - state.startX;
      const dy = e.clientY - state.startY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      state.distance = distance;

      if (distance > CANVAS_DATA.DRAG_THRESHOLD) {
        state.hasMoved = true;
        const newX = state.stageStartX + dx;
        const newY = state.stageStartY + dy;
        setPosition(constrainPosition(newX, newY, scale));
      }
    },
    [scale, constrainPosition, setPosition],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0 && e.button !== 1) return;

      setIsDragging(true);
      dragStateRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        stageStartX: position.x,
        stageStartY: position.y,
        distance: 0,
        hasMoved: false,
      };
    },
    [position],
  );

  const handleTouchStartNative = useCallback(
    (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.closest('button, [role="button"], .ui-element')) {
        return;
      }

      e.preventDefault();

      if (e.touches.length === 2) {
        setIsDragging(false);
        isPinchingRef.current = true;
        const [t1, t2] = [e.touches[0]!, e.touches[1]!];

        const dist = Math.hypot(
          t2.clientX - t1.clientX,
          t2.clientY - t1.clientY,
        );
        pinchRef.current = { startDist: dist, startScale: scale };
        return;
      }

      if (e.touches.length === 1) {
        const touch = e.touches[0]!;
        setIsDragging(true);
        dragStateRef.current = {
          startX: touch.clientX,
          startY: touch.clientY,
          stageStartX: position.x,
          stageStartY: position.y,
          distance: 0,
          hasMoved: false,
          clientX: touch.clientX,
          clientY: touch.clientY,
        };
      }
    },
    [position, scale],
  );

  const handleTouchMoveNative = useCallback(
    (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchRef.current) {
        e.preventDefault();
        dragStateRef.current.hasMoved = true;

        const [t1, t2] = [e.touches[0]!, e.touches[1]!];

        const dist = Math.hypot(
          t2.clientX - t1.clientX,
          t2.clientY - t1.clientY,
        );

        const newScale =
          (dist / pinchRef.current.startDist) * pinchRef.current.startScale;

        const limited = Math.max(
          CANVAS_DATA.MIN_SCALE,
          Math.min(newScale, CANVAS_DATA.MAX_SCALE),
        );

        const center = {
          x: (t1.clientX + t2.clientX) / 2,
          y: (t1.clientY + t2.clientY) / 2,
        };

        const mousePointTo = {
          x: (center.x - position.x) / scale,
          y: (center.y - position.y) / scale,
        };

        const newX = center.x - mousePointTo.x * limited;
        const newY = center.y - mousePointTo.y * limited;

        setScale(limited);
        setPosition(constrainPosition(newX, newY, limited));
        return;
      }

      if (isDraggingRef.current && e.touches.length === 1) {
        e.preventDefault();
        const touch = e.touches[0]!;
        const state = dragStateRef.current;

        const dx = touch.clientX - state.startX;
        const dy = touch.clientY - state.startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        state.distance = distance;

        if (distance > CANVAS_DATA.DRAG_THRESHOLD) {
          state.hasMoved = true;
          const newX = state.stageStartX + dx;
          const newY = state.stageStartY + dy;
          setPosition(constrainPosition(newX, newY, scale));
        }

        state.clientX = touch.clientX;
        state.clientY = touch.clientY;
      }
    },
    [position, scale, constrainPosition, setScale, setPosition],
  );

  const handleWheelNative = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const pointer = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      const mousePointTo = {
        x: (pointer.x - position.x) / scale,
        y: (pointer.y - position.y) / scale,
      };

      const scaleBy = 1.1;
      const newScale = e.deltaY > 0 ? scale / scaleBy : scale * scaleBy;

      const limited = Math.max(
        CANVAS_DATA.MIN_SCALE,
        Math.min(newScale, CANVAS_DATA.MAX_SCALE),
      );

      const newX = pointer.x - mousePointTo.x * limited;
      const newY = pointer.y - mousePointTo.y * limited;

      setScale(limited);
      setPosition(constrainPosition(newX, newY, limited));
    },
    [position, scale, constrainPosition, setScale, setPosition, canvasRef],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener("touchstart", handleTouchStartNative, {
      passive: false,
    });
    canvas.addEventListener("touchmove", handleTouchMoveNative, {
      passive: false,
    });
    canvas.addEventListener("wheel", handleWheelNative, {
      passive: false,
    });

    return () => {
      canvas.removeEventListener("touchstart", handleTouchStartNative);
      canvas.removeEventListener("touchmove", handleTouchMoveNative);
      canvas.removeEventListener("wheel", handleWheelNative);
    };
  }, [
    canvasRef,
    handleTouchStartNative,
    handleTouchMoveNative,
    handleWheelNative,
  ]);

  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchend", handleTouchEnd, { passive: false });

    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleMouseUp, handleMouseMove, handleTouchEnd]);

  return {
    isDragging,
    handleMouseDown,
  };
};

export { useCanvasControls };
