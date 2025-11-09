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
  const renderRequestedRef = useRef(false);

  const [isDragging, setIsDragging] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

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

  const {
    pixels,
    unpaintedPixels,
    addUnpaintedPixel,
    removeUnpaintedPixel,
    selectedColor,
    initSocket,
    cleanupSocket,
  } = useCanvasStore();

  const lastPixelsRef = useRef<typeof pixels>({});
  const lastUnpaintedRef = useRef<typeof unpaintedPixels>({});

  const { t } = useTranslation();

  useEffect(() => {
    initSocket();
    return () => cleanupSocket();
  }, [initSocket, cleanupSocket]);

  const getContainerSize = useCallback(() => {
    const width = containerRef.current?.offsetWidth ?? window.innerWidth;
    const height = containerRef.current?.offsetHeight ?? window.innerHeight;

    return { width, height };
  }, []);

  const centerCanvas = useCallback(() => {
    const { width: stageWidth, height: stageHeight } = getContainerSize();
    const canvasWidth = CANVAS_DATA.CANVAS_WIDTH * CANVAS_DATA.PIXEL_SIZE;
    const canvasHeight = CANVAS_DATA.CANVAS_HEIGHT * CANVAS_DATA.PIXEL_SIZE;

    setPosition({
      x: (stageWidth - canvasWidth) / 2,
      y: (stageHeight - canvasHeight) / 2,
    });
  }, [getContainerSize]);

  const drawOffscreen = useCallback(() => {
    if (!offscreenRef.current) {
      offscreenRef.current = document.createElement("canvas");
    }

    const offscreen = offscreenRef.current;
    const ctx = offscreen.getContext("2d", { alpha: false });

    if (!ctx) return;

    const canvasWidth = CANVAS_DATA.CANVAS_WIDTH * CANVAS_DATA.PIXEL_SIZE;
    const canvasHeight = CANVAS_DATA.CANVAS_HEIGHT * CANVAS_DATA.PIXEL_SIZE;

    if (
      lastPixelsRef.current !== pixels ||
      lastUnpaintedRef.current !== unpaintedPixels
    ) {
      offscreen.width = canvasWidth;
      offscreen.height = canvasHeight;

      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      Object.values(pixels).forEach((pixel) => {
        ctx.fillStyle = pixel.color;
        ctx.fillRect(
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

        ctx.fillStyle = color;
        ctx.fillRect(
          x * CANVAS_DATA.PIXEL_SIZE,
          y * CANVAS_DATA.PIXEL_SIZE,
          CANVAS_DATA.PIXEL_SIZE,
          CANVAS_DATA.PIXEL_SIZE,
        );
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1;
        ctx.strokeRect(
          x * CANVAS_DATA.PIXEL_SIZE,
          y * CANVAS_DATA.PIXEL_SIZE,
          CANVAS_DATA.PIXEL_SIZE,
          CANVAS_DATA.PIXEL_SIZE,
        );
      });

      ctx.strokeStyle = "#888";
      ctx.lineWidth = 3;
      ctx.strokeRect(0, 0, canvasWidth, canvasHeight);

      lastPixelsRef.current = pixels;
      lastUnpaintedRef.current = unpaintedPixels;
    }
  }, [pixels, unpaintedPixels]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const { width, height } = getContainerSize();

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    drawOffscreen();
    const offscreen = offscreenRef.current;
    if (!offscreen) return;

    const canvasWidth = CANVAS_DATA.CANVAS_WIDTH * CANVAS_DATA.PIXEL_SIZE;
    const canvasHeight = CANVAS_DATA.CANVAS_HEIGHT * CANVAS_DATA.PIXEL_SIZE;

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.translate(position.x, position.y);
    ctx.drawImage(
      offscreen,
      0,
      0,
      canvasWidth,
      canvasHeight,
      0,
      0,
      canvasWidth * scale,
      canvasHeight * scale,
    );
    ctx.restore();

    renderRequestedRef.current = false;
  }, [drawOffscreen, position, scale, getContainerSize]);

  const requestRender = useCallback(() => {
    if (!renderRequestedRef.current) {
      renderRequestedRef.current = true;
      requestAnimationFrame(drawCanvas);
    }
  }, [drawCanvas]);

  useEffect(() => {
    requestRender();
  }, [pixels, unpaintedPixels, position, scale, requestRender]);

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
      if (
        x < 0 ||
        y < 0 ||
        x >= CANVAS_DATA.CANVAS_WIDTH ||
        y >= CANVAS_DATA.CANVAS_HEIGHT
      )
        return;

      const key = `${x}:${y}`;

      if (isPaletteOpen) {
        if (isEraserActive) {
          if (unpaintedPixels[key]) removeUnpaintedPixel(x, y);
          else toast.warn(t("canvas.errors.cannot-erase-unsent"));
        } else {
          addUnpaintedPixel(x, y, selectedColor);
        }
        return;
      }

      if (!isPaletteOpen && onPixelClick) {
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

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0 && e.button !== 1) return;

      setIsDragging(true);

      isDraggingRef.current = true;
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

        const constrained = constrainPosition(
          state.stageStartX + dx,
          state.stageStartY + dy,
          scale,
        );
        setPosition(constrained);
      }
    },
    [scale, constrainPosition],
  );

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingRef.current) return;

      const state = dragStateRef.current;

      setIsDragging(false);

      isDraggingRef.current = false;

      if (state.distance <= CANVAS_DATA.DRAG_THRESHOLD && !state.hasMoved) {
        handleClick(e.clientX, e.clientY);
      }
    },
    [handleClick],
  );

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        isPinchingRef.current = true;

        const t0 = e.touches[0];
        const t1 = e.touches[1];

        if (!t0 || !t1) return;

        const dist = Math.hypot(
          t1.clientX - t0.clientX,
          t1.clientY - t0.clientY,
        );
        pinchRef.current = { startDist: dist, startScale: scale };
      } else if (e.touches.length === 1) {
        const t0 = e.touches[0];

        if (!t0) return;

        setIsDragging(true);
        isDraggingRef.current = true;
        dragStateRef.current = {
          startX: t0.clientX,
          startY: t0.clientY,
          stageStartX: position.x,
          stageStartY: position.y,
          distance: 0,
          hasMoved: false,
          clientX: t0.clientX,
          clientY: t0.clientY,
        };
      }
    },
    [position, scale],
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchRef.current) {
        e.preventDefault();
        const t0 = e.touches[0];
        const t1 = e.touches[1];

        if (!t0 || !t1) return;

        const dist = Math.hypot(
          t1.clientX - t0.clientX,
          t1.clientY - t0.clientY,
        );
        const newScale = Math.max(
          CANVAS_DATA.MIN_SCALE,
          Math.min(
            (dist / pinchRef.current.startDist) * pinchRef.current.startScale,
            CANVAS_DATA.MAX_SCALE,
          ),
        );

        const pointer = {
          x: (t0.clientX + t1.clientX) / 2,
          y: (t0.clientY + t1.clientY) / 2,
        };
        const mousePointTo = {
          x: (pointer.x - position.x) / scale,
          y: (pointer.y - position.y) / scale,
        };
        const constrained = constrainPosition(
          pointer.x - mousePointTo.x * newScale,
          pointer.y - mousePointTo.y * newScale,
          newScale,
        );

        setScale(newScale);
        setPosition(constrained);
      } else if (isDraggingRef.current && e.touches.length === 1) {
        e.preventDefault();
        const t0 = e.touches[0];

        if (!t0) return;

        const state = dragStateRef.current;
        const dx = t0.clientX - state.startX;
        const dy = t0.clientY - state.startY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        state.distance = distance;

        if (distance > CANVAS_DATA.DRAG_THRESHOLD) {
          state.hasMoved = true;
          const constrained = constrainPosition(
            state.stageStartX + dx,
            state.stageStartY + dy,
            scale,
          );
          setPosition(constrained);
        }
        state.clientX = t0.clientX;
        state.clientY = t0.clientY;
      }
    },
    [position, scale, constrainPosition],
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (isPinchingRef.current && e.touches.length < 2) {
        isPinchingRef.current = false;
        pinchRef.current = null;
      }

      if (e.touches.length === 0) {
        const state = dragStateRef.current;

        setIsDragging(false);
        isDraggingRef.current = false;

        if (
          !isPinchingRef.current &&
          state.distance <= CANVAS_DATA.DRAG_THRESHOLD &&
          !state.hasMoved &&
          state.clientX !== undefined &&
          state.clientY !== undefined
        ) {
          handleClick(state.clientX, state.clientY);
        }
      }
    },
    [handleClick],
  );

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const canvas = canvasRef.current;

      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const pointer = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      const mousePointTo = {
        x: (pointer.x - position.x) / scale,
        y: (pointer.y - position.y) / scale,
      };
      const scaleBy = 1.1;
      const newScale = Math.max(
        CANVAS_DATA.MIN_SCALE,
        Math.min(
          e.deltaY > 0 ? scale / scaleBy : scale * scaleBy,
          CANVAS_DATA.MAX_SCALE,
        ),
      );
      const constrained = constrainPosition(
        pointer.x - mousePointTo.x * newScale,
        pointer.y - mousePointTo.y * newScale,
        newScale,
      );
      setScale(newScale);
      setPosition(constrained);
    },
    [position, scale, constrainPosition],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd, { passive: false });
    canvas.addEventListener("touchcancel", handleTouchEnd, { passive: false });
    canvas.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
      canvas.removeEventListener("touchcancel", handleTouchEnd);
      canvas.removeEventListener("wheel", handleWheel);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, handleWheel]);

  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [handleMouseUp, handleMouseMove]);

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
