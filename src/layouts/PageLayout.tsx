import { useSettingsStore } from "@/store/useSettingsStore";

import { Navbar } from "@/components/navbar/Navbar";
import { Settings } from "@/components/settings/Settings";

import styles from "./styles/PageLayout.module.css";

interface IPageLayoutProps {
  children: React.ReactNode;
}

const PageLayout = ({ children }: IPageLayoutProps) => {
  const { isSettingsOpen, closeSettings } = useSettingsStore();

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <Settings isOpen={isSettingsOpen} onClose={closeSettings} />

        {children}
      </main>
    </>
  );
};

export { PageLayout };
