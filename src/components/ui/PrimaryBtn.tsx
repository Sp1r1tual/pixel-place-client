import styles from "./styles/PrimaryBtn.module.css";

interface IPrimaryBtnProps {
  image?: string;
  text?: string;
  onClick?: () => void;
  isLoading: boolean;
  progressText?: string;
  progressCurrent?: number;
  progressFull?: number;
}

const PrimaryBtn = ({
  onClick,
  image,
  text,
  isLoading,
  progressText,
  progressCurrent,
  progressFull,
}: IPrimaryBtnProps) => {
  const showProgress =
    progressCurrent !== undefined &&
    progressFull !== undefined &&
    progressFull > 0;

  return (
    <button
      className={styles.primaryBtn}
      disabled={isLoading}
      onClick={onClick}
    >
      {image && <img src={image} className={styles.icon} alt="icon" />}

      <div className={styles.textWrapper}>
        {text && <span className={styles.text}>{text}</span>}
        {showProgress && (
          <span className={styles.progress}>
            {progressText
              ? `${progressText} ${progressCurrent} / ${progressFull}`
              : `${progressCurrent} / ${progressFull}`}
          </span>
        )}
      </div>
    </button>
  );
};

export { PrimaryBtn };
