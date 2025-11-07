import { useRef, useEffect } from "react";

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

  useEffect(() => {
    if (!showTimer || !timerData || !displayRef?.current) return;

    const { energy, maxEnergy, lastEnergyUpdate, recoverySpeed } = timerData;

    const updateTimer = () => {
      const now = Date.now();
      const secondsPassed = (now - lastEnergyUpdate) / 1000;
      const currentEnergy = Math.min(
        energy + secondsPassed / recoverySpeed,
        maxEnergy,
      );

      const displayEnergy = Math.floor(currentEnergy);

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
  }, [timerData, displayRef, progressText, showTimer]);
};

export { useEnergyTimer };
