import styles from "./styles/Spinner.module.css";

interface ISpinnerProps {
  size?: "small" | "medium" | "large";
}

const Spinner = ({ size = "medium" }: ISpinnerProps) => {
  return (
    <div className={`${styles.spinner} ${styles[size]}`}>
      <div className={styles.spinnerCircle} />
    </div>
  );
};

export { Spinner };
