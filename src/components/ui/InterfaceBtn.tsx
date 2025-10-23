import styles from "./styles/InterfaceBtn.module.css";

interface IInterfaceBtnProps {
  imgDefault?: string;
  imgActive?: string;
  isActive?: boolean;
  onClick: (state: boolean) => void;
  disabled?: boolean;
  text?: string;
  id: string;
  className?: string;
}

const InterfaceBtn = ({
  imgDefault,
  imgActive,
  isActive,
  onClick,
  disabled = false,
  text,
  id,
  className,
}: IInterfaceBtnProps) => {
  const handleClick = () => {
    onClick(!isActive);
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
