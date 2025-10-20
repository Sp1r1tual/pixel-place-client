import { useState } from "react";

import styles from "./styles/InterfaceBtn.module.css";

interface IInterfaceBtnProps {
  imgDefault?: string;
  imgActive?: string;
  onClick: (state: boolean) => void;
  disabled?: boolean;
  text?: string;
  id: string;
  className?: string | undefined;
}

const InterfaceBtn = ({
  imgDefault,
  imgActive,
  onClick,
  disabled = false,
  text,
  id,
  className,
}: IInterfaceBtnProps) => {
  const [isActive, setIsActive] = useState(false);

  const handleClick = () => {
    const newState = !isActive;
    setIsActive(newState);
    onClick(newState);
  };

  return (
    <button
      id={id}
      onClick={handleClick}
      disabled={disabled}
      className={`${styles.interfaceBtn} ${isActive ? styles.active : ""} ${className || ""}`}
    >
      <img
        src={isActive && imgActive ? imgActive : imgDefault}
        alt={text || "button"}
        className={styles.icon}
      />
      {text && <span className={styles.text}>{text}</span>}
    </button>
  );
};

export { InterfaceBtn };
