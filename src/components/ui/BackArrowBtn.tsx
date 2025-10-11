import backArrowBtnSvg from "@/assets/arrow-back-circle-outline-svgrepo-com.svg";

import styles from "./styles/BackArrowBtn.module.css";

interface BackArrowBtnProps {
  onClick?: () => void;
}

const BackArrowBtn = ({ onClick }: BackArrowBtnProps) => {
  return (
    <button className={styles.backBtn} onClick={onClick}>
      <img src={backArrowBtnSvg} alt="Back" className={styles.icon} />
    </button>
  );
};

export { BackArrowBtn };
