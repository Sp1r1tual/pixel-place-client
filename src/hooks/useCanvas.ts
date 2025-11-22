import {
  useRef,
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
  useEffectEvent,
} from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { useCanvasStore } from "@/store/useCanvasStore";

import { IPixel } from "@/types";

import { CANVAS_DATA } from "@/data/canvas";

interface DragState {
  startX: number;
  startY: number;
  stageStartX: number;
  stageStartY: number;
  distance: number;
  hasMoved: boolean;
  clientX?: number;
  clientY?: number;
}

const useCanvas = (
  isPaletteOpen: boolean,
  isEraserActive: boolean,
  onPixelClick?: (pixel: IPixel) => void,
) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);
  const isPinchingRef = useRef(false);
  const isDraggingRef = useRef(false);

  const [isDragging, setIsDragging] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const {
    pixels,
    unpaintedPixels,
    addUnpaintedPixel,
    removeUnpaintedPixel,
    selectedColor,
    initSocket,
    cleanupSocket,
  } = useCanvasStore();

  const dragStateRef = useRef<DragState>({
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

  useLayoutEffect(() => {
    if (!offscreenRef.current) {
      offscreenRef.current = document.createElement("canvas");
    }
  }, []);

  const getContainerSize = useCallback(() => {
    if (!containerRef.current) {
      return { width: window.innerWidth, height: window.innerHeight };
    }
    return {
      width: containerRef.current.offsetWidth,
      height: containerRef.current.offsetHeight,
    };
  }, []);

  const centerCanvas = useCallback(() => {
    const { width: stageWidth, height: stageHeight } = getContainerSize();
    const canvasWidth = CANVAS_DATA.CANVAS_WIDTH * CANVAS_DATA.PIXEL_SIZE;
    const canvasHeight = CANVAS_DATA.CANVAS_HEIGHT * CANVAS_DATA.PIXEL_SIZE;

    const x = (stageWidth - canvasWidth) / 2;
    const y = (stageHeight - canvasHeight) / 2;

    setPosition({ x, y });
  }, [getContainerSize]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const offscreen = offscreenRef.current;

    if (!canvas || !offscreen) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = getContainerSize();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const canvasWidth = CANVAS_DATA.CANVAS_WIDTH * CANVAS_DATA.PIXEL_SIZE;
    const canvasHeight = CANVAS_DATA.CANVAS_HEIGHT * CANVAS_DATA.PIXEL_SIZE;

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      offscreen,
      0,
      0,
      canvasWidth,
      canvasHeight,
      position.x,
      position.y,
      canvasWidth * scale,
      canvasHeight * scale,
    );
  }, [position, scale, getContainerSize]);

  const updateOffscreen = useCallback(() => {
    const offscreen = offscreenRef.current;
    if (!offscreen) return;

    const offCtx = offscreen.getContext("2d");
    if (!offCtx) return;

    const canvasWidth = CANVAS_DATA.CANVAS_WIDTH * CANVAS_DATA.PIXEL_SIZE;
    const canvasHeight = CANVAS_DATA.CANVAS_HEIGHT * CANVAS_DATA.PIXEL_SIZE;

    offscreen.width = canvasWidth;
    offscreen.height = canvasHeight;

    offCtx.clearRect(0, 0, canvasWidth, canvasHeight);

    offCtx.fillStyle = "#fff";
    offCtx.fillRect(0, 0, canvasWidth, canvasHeight);

    Object.entries(pixels).forEach(([_, pixel]) => {
      offCtx.fillStyle = pixel.color;
      offCtx.fillRect(
        pixel.x * CANVAS_DATA.PIXEL_SIZE,
        pixel.y * CANVAS_DATA.PIXEL_SIZE,
        CANVAS_DATA.PIXEL_SIZE,
        CANVAS_DATA.PIXEL_SIZE,
      );
    });

    Object.entries(unpaintedPixels).forEach(([key, color]) => {
      const [xStr, yStr] = key.split(":");
      const x = Number(xStr);
      const y = Number(yStr);

      offCtx.fillStyle = color;
      offCtx.fillRect(
        x * CANVAS_DATA.PIXEL_SIZE,
        y * CANVAS_DATA.PIXEL_SIZE,
        CANVAS_DATA.PIXEL_SIZE,
        CANVAS_DATA.PIXEL_SIZE,
      );

      offCtx.strokeStyle = "#fff";
      offCtx.lineWidth = 1;
      offCtx.strokeRect(
        x * CANVAS_DATA.PIXEL_SIZE,
        y * CANVAS_DATA.PIXEL_SIZE,
        CANVAS_DATA.PIXEL_SIZE,
        CANVAS_DATA.PIXEL_SIZE,
      );
    });

    offCtx.strokeStyle = "#888888";
    offCtx.lineWidth = 3;
    offCtx.strokeRect(0, 0, canvasWidth, canvasHeight);

    offCtx.shadowColor = "#000";
    offCtx.shadowBlur = 4;
    offCtx.strokeRect(0, 0, canvasWidth, canvasHeight);

    drawCanvas();
  }, [pixels, unpaintedPixels, drawCanvas]);

  const onUpdateOffscreen = useEffectEvent(updateOffscreen);
  const onDrawCanvas = useEffectEvent(drawCanvas);

  useLayoutEffect(() => {
    onUpdateOffscreen();
  }, [pixels, unpaintedPixels]);

  useLayoutEffect(() => {
    onDrawCanvas();
  }, [position, scale]);

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
    [position, scale],
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

  const constrainPosition = useCallback(
    (newX: number, newY: number, currentScale: number) => {
      const { width: stageWidth, height: stageHeight } = getContainerSize();
      const scaledWidth =
        CANVAS_DATA.CANVAS_WIDTH * CANVAS_DATA.PIXEL_SIZE * currentScale;
      const scaledHeight =
        CANVAS_DATA.CANVAS_HEIGHT * CANVAS_DATA.PIXEL_SIZE * currentScale;

      const minX = Math.min(0, stageWidth - scaledWidth);
      const maxX = 0;
      const minY = Math.min(0, stageHeight - scaledHeight);
      const maxY = 0;

      return {
        x: Math.max(minX, Math.min(maxX, newX)),
        y: Math.max(minY, Math.min(maxY, newY)),
      };
    },
    [getContainerSize],
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
    [scale, constrainPosition],
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
    [position, scale, constrainPosition],
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
    [position, scale, constrainPosition],
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
  }, [handleTouchStartNative, handleTouchMoveNative, handleWheelNative]);

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
    canvasRef,
    containerRef,
    isDragging,
    pixels,
    unpaintedPixels,
    handleMouseDown,
    centerCanvas,
  };
};

export { useCanvas };
