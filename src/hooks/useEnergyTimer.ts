import { useRef, useEffect } from "react";

import { useCanvasStore } from "@/store/useCanvasStore";

interface ITimerData {
  energy: number;
  maxEnergy: number;
  lastEnergyUpdate: number;
  recoverySpeed: number;
}

const useEnergyTimer = (
  timerData?: ITimerData,
  displayRef?: React.RefObject<HTMLSpanElement | null>,
  progressText?: string,
  showTimer?: boolean,
) => {
  const frameRef = useRef<number | undefined>(undefined);
  const setEnergy = useCanvasStore((state) => state.setEnergy);
  const unpaintedPixels = useCanvasStore((state) => state.unpaintedPixels);

  useEffect(() => {
    if (!showTimer || !timerData || !displayRef?.current) return;

    const { maxEnergy, recoverySpeed } = timerData;

    const updateTimer = () => {
      const now = Date.now();
      const { energy: prevEnergy, lastEnergyUpdate } =
        useCanvasStore.getState();

      const secondsPassed = (now - lastEnergyUpdate) / 1000;
      const currentEnergy = Math.min(
        prevEnergy + secondsPassed / recoverySpeed,
        maxEnergy,
      );

      const availableEnergy =
        Math.floor(currentEnergy) - Object.keys(unpaintedPixels).length;
      const displayEnergy = Math.max(availableEnergy, 0);

      setEnergy(currentEnergy);

      let timeText = "";
      if (displayEnergy < maxEnergy) {
        const fractional = currentEnergy % 1;
        const secondsUntilNext = Math.ceil((1 - fractional) * recoverySpeed);
        const minutes = Math.floor(secondsUntilNext / 60);
        const seconds = secondsUntilNext % 60;
        timeText = `${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`;
      }

      displayRef.current!.textContent = progressText
        ? `${progressText} ${displayEnergy} / ${maxEnergy}${
            timeText && displayEnergy < maxEnergy ? ` (${timeText})` : ""
          }`
        : `${displayEnergy} / ${maxEnergy}${
            timeText && displayEnergy < maxEnergy ? ` (${timeText})` : ""
          }`;

      frameRef.current = requestAnimationFrame(updateTimer);
    };

    frameRef.current = requestAnimationFrame(updateTimer);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [
    timerData,
    displayRef,
    progressText,
    showTimer,
    setEnergy,
    unpaintedPixels,
  ]);
};

export { useEnergyTimer };
