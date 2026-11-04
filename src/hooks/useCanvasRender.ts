import { useRef, useCallback, useEffect, useLayoutEffect } from "react";

import { useCanvasStore } from "@/store/useCanvasStore";

import { CANVAS_DATA } from "@/data/canvas";

import { pixelLayer } from "@/utils/canvas/pixelLayer";

const useCanvasRenderer = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const scaleRef = useRef(1);
  const positionRef = useRef({ x: 0, y: 0 });
  const rafIdRef = useRef<number | null>(null);

  const pixelsVersion = useCanvasStore((state) => state.pixelsVersion);
  const unpaintedPixels = useCanvasStore((state) => state.unpaintedPixels);

  useEffect(() => {
    useCanvasStore.getState().initSocket();

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
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

  const drawCanvasInternal = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = getContainerSize();
    const dpr = window.devicePixelRatio || 1;
    const bufferWidth = Math.round(width * dpr);
    const bufferHeight = Math.round(height * dpr);

    // Assigning canvas.width reallocates the buffer, so only do it on a real resize.
    if (canvas.width !== bufferWidth || canvas.height !== bufferHeight) {
      canvas.width = bufferWidth;
      canvas.height = bufferHeight;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const canvasWidth = CANVAS_DATA.CANVAS_WIDTH * CANVAS_DATA.PIXEL_SIZE;
    const canvasHeight = CANVAS_DATA.CANVAS_HEIGHT * CANVAS_DATA.PIXEL_SIZE;

    ctx.imageSmoothingEnabled = false;

    ctx.save();
    ctx.translate(positionRef.current.x, positionRef.current.y);
    ctx.scale(scaleRef.current, scaleRef.current);

    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(pixelLayer, 0, 0, canvasWidth, canvasHeight);

    const state = useCanvasStore.getState();

    Object.entries(state.unpaintedPixels).forEach(([key, color]) => {
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

    ctx.strokeStyle = "#888888";
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, canvasWidth, canvasHeight);

    ctx.shadowColor = "#000";
    ctx.shadowBlur = 4;
    ctx.strokeRect(0, 0, canvasWidth, canvasHeight);
    ctx.restore();
  }, [getContainerSize]);

  const scheduleRedraw = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }

    rafIdRef.current = requestAnimationFrame(() => {
      drawCanvasInternal();
      rafIdRef.current = null;
    });
  }, [drawCanvasInternal]);

  const centerCanvas = useCallback(() => {
    const { width: stageWidth, height: stageHeight } = getContainerSize();
    const canvasWidth = CANVAS_DATA.CANVAS_WIDTH * CANVAS_DATA.PIXEL_SIZE;
    const canvasHeight = CANVAS_DATA.CANVAS_HEIGHT * CANVAS_DATA.PIXEL_SIZE;

    const x = (stageWidth - canvasWidth) / 2;
    const y = (stageHeight - canvasHeight) / 2;

    positionRef.current = { x, y };
    drawCanvasInternal();
  }, [getContainerSize, drawCanvasInternal]);

  useLayoutEffect(() => {
    drawCanvasInternal();
  }, [drawCanvasInternal]);

  useEffect(() => {
    scheduleRedraw();
  }, [pixelsVersion, unpaintedPixels, scheduleRedraw]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(scheduleRedraw);
    observer.observe(container);

    return () => observer.disconnect();
  }, [scheduleRedraw]);

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

  const setScale = useCallback(
    (newScale: number) => {
      scaleRef.current = newScale;
      scheduleRedraw();
    },
    [scheduleRedraw],
  );

  const setPosition = useCallback(
    (newPosition: { x: number; y: number }) => {
      positionRef.current = newPosition;
      scheduleRedraw();
    },
    [scheduleRedraw],
  );

  return {
    canvasRef,
    containerRef,
    scaleRef,
    positionRef,
    setScale,
    setPosition,
    centerCanvas,
    constrainPosition,
  };
};

export { useCanvasRenderer };
