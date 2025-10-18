import { useTranslation } from "react-i18next";

import { useAuthStore } from "@/store/useAuthStore";
import { useLanguageChange } from "@/hooks/useLanguageChange";

import { CloseBtn } from "../ui/CloseBtn";

import styles from "./styles/Settings.module.css";

interface ISettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const Settings = ({ isOpen, onClose }: ISettingsProps) => {
  const userId = useAuthStore((state) => state.user?.id ?? "");
  const { currentLang, languages, loading, changeLanguage } =
    useLanguageChange();

  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <div className={styles.closeBtnWrapper}>
          <CloseBtn onClick={onClose} />
        </div>

        <h2>{t("settings.title")}</h2>
        <span>User ID: {userId}</span>

        <div className={styles.languageRow}>
          <p>{t("settings.changeLanguage")}</p>
          <select
            value={currentLang}
            onChange={(e) => changeLanguage(e.target.value)}
            disabled={loading}
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export { Settings };
