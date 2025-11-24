import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useProfileStore } from "@/store/useProfileStore";
import { useSettingsStore } from "@/store/useSettingsStore";

import { Navbar } from "@/components/navbar/Navbar";
import { Profile } from "@/components/profile/Profile";
import { Settings } from "@/components/settings/Settings";
import { ConfirmChoiceModal } from "@/components/ui/ConfirmChoiceModal";

import styles from "./styles/PageLayout.module.css";

interface IPageLayoutProps {
  children: React.ReactNode;
}

const PageLayout = ({ children }: IPageLayoutProps) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { isProfileOpen, closeProfile } = useProfileStore();
  const { isSettingsOpen, closeSettings } = useSettingsStore();

  const { t } = useTranslation();

  return (
    <>
      <ConfirmChoiceModal
        isOpen={isConfirmOpen}
        title={t("navbar.dropdown.confirm-logout-title")}
        message={t("navbar.dropdown.confirm-logout-message")}
        highlightConfirm={false}
        onConfirm={() => {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }}
        onClose={() => setIsConfirmOpen(false)}
      />

      <Navbar onLogout={() => setIsConfirmOpen(true)} />

      <main className={styles.main}>
        <Profile isOpen={isProfileOpen} onClose={closeProfile} />
        <Settings isOpen={isSettingsOpen} onClose={closeSettings} />

        {children}
      </main>
    </>
  );
};

export { PageLayout };
