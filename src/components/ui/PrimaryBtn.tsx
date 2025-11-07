import { useRef } from "react";

import { useEnergyTimer } from "@/hooks/useEnergyTimer";

import styles from "./styles/PrimaryBtn.module.css";

interface IPrimaryBtnProps {
  image?: string;
  text?: string;
  onClick?: () => void;
  isLoading: boolean;
  disabled?: boolean;
  progressText?: string;
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
  showTimer = false,
  timerData,
}: IPrimaryBtnProps) => {
  const displayRef = useRef<HTMLSpanElement | null>(null);

  useEnergyTimer(timerData, displayRef, progressText, showTimer);

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
        {showTimer && <span ref={displayRef} className={styles.progress} />}
      </div>
    </button>
  );
};

export { PrimaryBtn };
