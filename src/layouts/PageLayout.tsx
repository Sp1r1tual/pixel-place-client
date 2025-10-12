import { Navbar } from "@/components/navbar/Navbar";

import styles from "./styles/PageLayout.module.css";

interface IPageLayoutProps {
  children: React.ReactNode;
}

const PageLayout = ({ children }: IPageLayoutProps) => {
  return (
    <>
      <Navbar />
      <main className={styles.main}>{children}</main>
    </>
  );
};

export { PageLayout };
