import { useEffect } from "react";
import i18n from "@/i18n";
import { useLocalizationStore } from "@/store/useLocalizationStore";
import { LANGUAGES, type Language } from "@/data/languages";

interface UseLanguageChangeReturn {
  currentLang: string;
  languages: readonly Language[];
  getCurrentLanguage: () => Language;
  loading: boolean;
  changeLanguage: (lang: string) => void;
}

const useLanguageChange = (): UseLanguageChangeReturn => {
  const language = useLocalizationStore((state) => state.language);
  const loading = useLocalizationStore((state) => state.loading);
  const changeLanguage = useLocalizationStore((state) => state.changeLanguage);

  useEffect(() => {
    if (language !== i18n.language) {
      changeLanguage(i18n.language);
    }
  }, [changeLanguage, language]);

  const getCurrentLanguage = (): Language =>
    LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return {
    currentLang: language,
    languages: LANGUAGES,
    getCurrentLanguage,
    loading,
    changeLanguage,
  };
};

export { useLanguageChange };
