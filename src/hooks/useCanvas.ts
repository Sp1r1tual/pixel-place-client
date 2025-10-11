import { useEffect, useRef, useState } from "react";
import { KonvaEventObject } from "konva/lib/Node";
import Konva from "konva";

import { useCanvasStore } from "@/store/useCanvasStore";

import { getSocket } from "@/sockets/canvasSockets";

const PIXEL_SIZE = 10;
const DRAG_THRESHOLD = 5;
const MIN_SCALE = 0.5;
const MAX_SCALE = 5;

interface PointerPos {
  x: number;
  y: number;
}

const useCanvas = () => {
  const { pixels, setPixel, initSocket, cleanupSocket } = useCanvasStore();
  const stageRef = useRef<Konva.Stage | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<PointerPos>({ x: 0, y: 0 });
  const [stagePos, setStagePos] = useState<PointerPos>({ x: 0, y: 0 });
  const [dragDistance, setDragDistance] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);

  useEffect(() => {
    initSocket();
    return () => cleanupSocket();
  }, [initSocket, cleanupSocket]);

  const startDrag = (pointer: PointerPos) => {
    setIsDragging(true);
    setHasMoved(false);
    setDragDistance(0);
    setDragStart({ x: pointer.x - stagePos.x, y: pointer.y - stagePos.y });
  };

  const dragMove = (pointer: PointerPos) => {
    const stage = stageRef.current;
    if (!stage) return;

    const dx = pointer.x - (dragStart.x + stagePos.x);
    const dy = pointer.y - (dragStart.y + stagePos.y);
    const distance = Math.sqrt(dx * dx + dy * dy);
    setDragDistance(distance);

    if (distance > DRAG_THRESHOLD) {
      setHasMoved(true);

      const newPos = { x: pointer.x - dragStart.x, y: pointer.y - dragStart.y };
      stage.x(newPos.x);
      stage.y(newPos.y);
      setStagePos(newPos);
    }
  };

  const endDrag = (pointer?: PointerPos) => {
    const stage = stageRef.current;
    if (!stage) return;

    if (isDragging && dragDistance <= DRAG_THRESHOLD && !hasMoved && pointer) {
      const scale = stage.scaleX();
      const stageX = stage.x();
      const stageY = stage.y();

      const x = Math.floor((pointer.x - stageX) / (PIXEL_SIZE * scale));
      const y = Math.floor((pointer.y - stageY) / (PIXEL_SIZE * scale));
      const color = "#000000";

      setPixel(x, y, color);
      getSocket().emit("sendBatch", [{ x, y, color }]);
    }

    setIsDragging(false);
    setHasMoved(false);
    setDragDistance(0);
  };

  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    const stage = stageRef.current;
    if (!stage) return;

    if (e.evt.button === 0 || e.evt.button === 1) {
      const pointer = stage.getPointerPosition();
      if (pointer) startDrag(pointer);
    }
  };

  const handleMouseMove = () => {
    const stage = stageRef.current;
    if (!stage || !isDragging) return;

    const pointer = stage.getPointerPosition();
    if (pointer) dragMove(pointer);
  };

  const handleMouseUp = () => {
    const stage = stageRef.current;
    if (!stage) return;

    const pointer = stage.getPointerPosition();
    endDrag(pointer ?? undefined);
  };

  const handleTouchStart = (e: KonvaEventObject<TouchEvent>) => {
    const stage = stageRef.current;
    if (!stage || e.evt.touches.length !== 2) return;

    e.evt.preventDefault();
    const pointer = stage.getPointerPosition();
    if (pointer) startDrag(pointer);
  };

  const handleTouchMove = (e: KonvaEventObject<TouchEvent>) => {
    const stage = stageRef.current;
    if (!stage || !isDragging || e.evt.touches.length !== 2) return;

    e.evt.preventDefault();
    const pointer = stage.getPointerPosition();
    if (pointer) dragMove(pointer);
  };

  const handleTouchEnd = () => setIsDragging(false);

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
    setStagePos(newPos);
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
