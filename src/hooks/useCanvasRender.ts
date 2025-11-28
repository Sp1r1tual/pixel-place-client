import {
  useRef,
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
} from "react";

import { useCanvasStore } from "@/store/useCanvasStore";

import { CANVAS_DATA } from "@/data/canvas";

const useCanvasRenderer = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const { pixels, unpaintedPixels, initSocket, cleanupSocket } =
    useCanvasStore();

  useEffect(() => {
    initSocket();
    return () => cleanupSocket();
  }, [initSocket, cleanupSocket]);

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
    if (!canvas) return;

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

    ctx.save();
    ctx.translate(position.x, position.y);
    ctx.scale(scale, scale);

    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    Object.entries(pixels).forEach(([_, pixel]) => {
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

    ctx.strokeStyle = "#888888";
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, canvasWidth, canvasHeight);

    ctx.shadowColor = "#000";
    ctx.shadowBlur = 4;
    ctx.strokeRect(0, 0, canvasWidth, canvasHeight);
    ctx.restore();
  }, [position, scale, getContainerSize, pixels, unpaintedPixels]);

  useLayoutEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

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

  return {
    canvasRef,
    containerRef,
    scale,
    setScale,
    position,
    setPosition,
    centerCanvas,
    constrainPosition,
    pixels,
    unpaintedPixels,
  };
};

export { useCanvasRenderer };
