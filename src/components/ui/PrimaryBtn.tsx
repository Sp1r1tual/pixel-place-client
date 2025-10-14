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
  return (
    <button
      className={styles.primaryBtn}
      disabled={isLoading}
      onClick={onClick}
    >
      <img src={image} className={styles.icon} />

      <div className={styles.info}>
        {text}
        {progressText} {progressCurrent} / {progressFull}
      </div>
    </button>
  );
};

export { PrimaryBtn };
