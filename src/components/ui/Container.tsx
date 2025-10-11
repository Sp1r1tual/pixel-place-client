import styles from "./styles/Container.module.css";

interface IContainerProps {
  children: React.ReactNode;
  showBorder?: boolean;
  showPadding?: boolean;
}

const Container = ({
  children,
  showBorder = true,
  showPadding = true,
}: IContainerProps) => {
  return (
    <div
      className={`${styles.container} ${!showBorder ? styles.noBorder : ""} ${!showPadding ? styles.noPadding : ""}`}
    >
      {children}
    </div>
  );
};

export { Container };
