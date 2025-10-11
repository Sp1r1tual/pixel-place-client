import React from "react";
import styles from "./styles/DropdownBtn.module.css";

interface DropdownBtnProps {
  text?: string;
  icon?: string;
  href?: string;
  onClick?: () => void;
  className?: string | undefined;
}

const DropdownBtn: React.FC<DropdownBtnProps> = ({
  text,
  icon,
  href,
  onClick,
  className,
}) => {
  const content = (
    <div className={`${styles.btn} ${className || ""}`}>
      {icon && <img src={icon} alt={text} className={styles.icon} />}
      {text && <span>{text}</span>}
    </div>
  );

  if (href) {
    return (
      <a href={href} onClick={onClick}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick}>
      {content}
    </button>
  );
};

export { DropdownBtn };
