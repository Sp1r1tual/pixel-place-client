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
    progressText !== undefined &&
    progressCurrent !== undefined &&
    progressFull !== undefined;

  return (
    <button
      className={styles.primaryBtn}
      disabled={isLoading}
      onClick={onClick}
    >
      {image && <img src={image} className={styles.icon} />}

      <div className={styles.info}>
        {text}
        {showProgress && (
          <>
            {progressText} {progressCurrent} / {progressFull}
          </>
        )}
      </div>
    </button>
  );
};

export { PrimaryBtn };
