import { useState, useEffect } from "react";

import styles from "./styles/PrimaryBtn.module.css";

interface IPrimaryBtnProps {
  image?: string;
  text?: string;
  onClick?: () => void;
  isLoading: boolean;
  disabled?: boolean;
  progressText?: string;
  progressCurrent?: number;
  progressFull?: number;
  showTimer?: boolean;
  timerData?: {
    energy: number;
    maxEnergy: number;
    lastEnergyUpdate: number;
    recoverySpeed: number;
  };
}

const PrimaryBtn = ({
  onClick,
  image,
  text,
  isLoading,
  disabled = false,
  progressText,
  progressCurrent,
  progressFull,
  showTimer = false,
  timerData,
}: IPrimaryBtnProps) => {
  const [timeUntilNext, setTimeUntilNext] = useState<string>("");

  const showProgress =
    progressCurrent !== undefined &&
    progressFull !== undefined &&
    progressFull > 0;

  useEffect(() => {
    if (!showTimer || !timerData || !showProgress) {
      return;
    }

    const { energy, maxEnergy, lastEnergyUpdate, recoverySpeed } = timerData;

    if (energy >= maxEnergy) {
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const minutesPassed = (now - lastEnergyUpdate) / 60000;
      const currentEnergy = Math.min(
        energy + minutesPassed * recoverySpeed,
        maxEnergy,
      );

      if (currentEnergy >= maxEnergy) {
        setTimeUntilNext("");
        return;
      }

      const fractionalEnergy = currentEnergy % 1;
      const minutesUntilNext = (1 - fractionalEnergy) / recoverySpeed;
      const secondsUntilNext = Math.ceil(minutesUntilNext * 60);

      const minutes = Math.floor(secondsUntilNext / 60);
      const seconds = secondsUntilNext % 60;

      setTimeUntilNext(
        `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [showTimer, showProgress, timerData]);

  return (
    <button
      className={`${styles.primaryBtn} ${isLoading ? styles.loading : ""}`}
      disabled={isLoading || disabled}
      onClick={onClick}
    >
      {isLoading ? (
        <div className={styles.loader} />
      ) : (
        image && <img src={image} className={styles.icon} alt="icon" />
      )}

      <div className={styles.textWrapper}>
        {text && <span className={styles.text}>{text}</span>}
        {showProgress && (
          <span className={styles.progress}>
            {progressText
              ? `${progressText} ${progressCurrent} / ${progressFull}`
              : `${Math.floor(progressCurrent)} / ${progressFull}`}
            {timeUntilNext &&
              progressCurrent < progressFull &&
              ` (${timeUntilNext})`}
          </span>
        )}
      </div>
    </button>
  );
};

export { PrimaryBtn };
