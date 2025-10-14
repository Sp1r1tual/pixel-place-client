import pxPng from "@/assets/pixel-px.png";

import styles from "./styles/Balance.module.css";

interface IBalanceProps {
  amount: number;
  showIcon?: boolean;
}

const Balance: React.FC<IBalanceProps> = ({ amount, showIcon = true }) => {
  return (
    <div className={styles.balanceContainer}>
      {showIcon && <img src={pxPng} alt="px" className={styles.icon} />}

      <div className={styles.amount}>{amount}</div>
    </div>
  );
};

export { Balance };
