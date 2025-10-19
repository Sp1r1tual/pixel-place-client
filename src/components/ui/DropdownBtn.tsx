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
  const btnClass = [styles.btn, className].filter(Boolean).join(" ");

  const content = (
    <>
      {icon && <img src={icon} alt={text} className={styles.icon} />}
      {text && <span>{text}</span>}
    </>
  );

  if (href) {
    return (
      <a href={href} onClick={onClick} className={btnClass}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={btnClass}>
      {content}
    </button>
  );
};

export { DropdownBtn };
