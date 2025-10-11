import { Navbar } from "@/components/navbar/Navbar";
import { Footer } from "@/components/footer/Footer";

import styles from "./styles/PageLayout.module.css";

interface IPageLayoutProps {
  children: React.ReactNode;
}

const PageLayout = ({ children }: IPageLayoutProps) => {
  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>{children}</main>

      <Footer />
    </div>
  );
};

export { PageLayout };
