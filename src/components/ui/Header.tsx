import styles from "./styles/Header.module.css";

interface HeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
  color?: string;
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  className,
  color,
}) => {
  return (
    <div className={styles.headerWrapper + (className ? ` ${className}` : "")}>
      <h2 className={styles.header} style={{ color }}>
        {title}
      </h2>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </div>
  );
};

export { Header };
