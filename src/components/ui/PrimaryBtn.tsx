import styles from "./styles/PrimaryBtn.module.css";

interface IPrimaryBtnProps {
  image?: string;
  text?: string;
  onClick?: () => void;
  isLoading: boolean;
}

const PrimaryBtn = ({ onClick, image, text, isLoading }: IPrimaryBtnProps) => {
  return (
    <button
      className={styles.primaryBtn}
      disabled={isLoading}
      onClick={onClick}
    >
      <img src={image} className={styles.icon} />
      {text}
    </button>
  );
};

export { PrimaryBtn };
