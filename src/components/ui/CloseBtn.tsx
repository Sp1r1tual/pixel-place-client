import closeCircleSvg from "@/assets/close-circle-svgrepo-com.svg";

import styles from "./styles/CloseBtn.module.css";

interface ICloseBtnProps {
  onClick: () => void;
  isLoading?: boolean;
}

const CloseBtn = ({ onClick, isLoading }: ICloseBtnProps) => {
  return (
    <button className={styles.closeBtn} disabled={isLoading} onClick={onClick}>
      <img src={closeCircleSvg} className={styles.icon} />
    </button>
  );
};

export { CloseBtn };
