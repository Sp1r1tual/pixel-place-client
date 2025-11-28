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

  useEffect(() => {
    if (!showTimer || !timerData || !displayRef?.current) return;

    const {
      maxEnergy,
      recoverySpeed,
      energy: serverEnergy,
      lastEnergyUpdate: serverUpdate,
    } = timerData;

    const updateTimer = () => {
      const now = Date.now();
      const secondsPassed = (now - serverUpdate) / 1000;
      const currentEnergy = Math.min(
        serverEnergy + secondsPassed / recoverySpeed,
        maxEnergy,
      );

      const prev = useCanvasStore.getState().energy;
      const next = Math.floor(currentEnergy);
      if (Math.floor(prev) !== next) {
        setEnergy(currentEnergy);
      }

      const displayEnergy = Math.floor(currentEnergy);
      let timeText = "";

      if (displayEnergy < maxEnergy) {
        const fractional = currentEnergy % 1;
        const secondsUntilNext = Math.ceil((1 - fractional) * recoverySpeed);
        const minutes = Math.floor(secondsUntilNext / 60);
        const seconds = secondsUntilNext % 60;
        timeText = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
      }

      displayRef.current!.textContent = progressText
        ? `${progressText} ${displayEnergy} / ${maxEnergy}${timeText && displayEnergy < maxEnergy ? ` (${timeText})` : ""}`
        : `${displayEnergy} / ${maxEnergy}${timeText && displayEnergy < maxEnergy ? ` (${timeText})` : ""}`;

      frameRef.current = requestAnimationFrame(updateTimer);
    };

    frameRef.current = requestAnimationFrame(updateTimer);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [timerData, displayRef, progressText, showTimer, setEnergy]);
};

export { useEnergyTimer };
