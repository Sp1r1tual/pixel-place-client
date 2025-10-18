import { useTranslation } from "react-i18next";

import preloaderGif from "@/assets/pixel-dog-preloader.gif";

import styles from "./styles/Preloader.module.css";

interface IPreLoaderProps {
  fadeOut?: boolean;
}

const PreLoader = ({ fadeOut = false }: IPreLoaderProps) => {
  const { t } = useTranslation();

  return (
    <div className={`${styles.overlay} ${fadeOut ? styles.fadeOut : ""}`}>
      <div className={styles.content}>
        <img
          src={preloaderGif}
          alt="Loading..."
          className={styles.preloaderGif}
        />
        <p className={styles.loadingText}>{t("preloader.loading")}</p>
      </div>
    </div>
  );
};

export { PreLoader };
