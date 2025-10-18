import { create } from "zustand";
import i18n from "i18next";

import { LANGUAGES, type Language } from "@/data/languages";

interface LocalizationState {
  language: string;
  loading: boolean;
  setLanguage: (lang: string) => void;
  changeLanguage: (lang: string) => void;
  getCurrentLanguage: () => Language;
}
const useLocalizationStore = create<LocalizationState>((set, get) => ({
  language: i18n.language || "en",
  loading: false,

  setLanguage: (lang: string) => {
    set({ language: lang });
    i18n.changeLanguage(lang);
  },

  changeLanguage: (lang: string) => {
    if (lang === get().language) return;

    set({ loading: true });
    i18n
      .changeLanguage(lang)
      .then(() => {
        set({ language: lang, loading: false });
      })
      .catch(() => {
        set({ loading: false });
      });
  },

  getCurrentLanguage: () =>
    LANGUAGES.find((l) => l.code === get().language) || LANGUAGES[0],
}));

export { useLocalizationStore };
