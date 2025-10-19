import { useRef } from "react";
import { Outlet } from "react-router-dom";

import { usePixelBackground } from "@/hooks/usePixelBackground";
import { useLanguageChange } from "@/hooks/useLanguageChange";

import { Footer } from "@/components/footer/Footer";

import styles from "./styles/AuthorizationLayout.module.css";

const AuthorizationLayout = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  usePixelBackground({ canvasRef });

  const { currentLang, languages, changeLanguage } = useLanguageChange();

  return (
    <div className={styles.wrapper}>
      <canvas ref={canvasRef} className={styles.backgroundCanvas} />

      <div className={styles.topBar}>
        <select
          className={styles.languageSelect}
          value={currentLang}
          onChange={(e) => changeLanguage(e.target.value)}
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      <main className={styles.content}>
        <section className={styles.formSection}>
          <Outlet />
        </section>
      </main>

      <Footer />
    </div>
  );
};

export { AuthorizationLayout };
