import preloaderGif from "@/assets/pixel-dog-preloader.gif";

import styles from "./styles/Preloader.module.css";

interface IPreLoaderProps {
  fadeOut?: boolean;
}

const PreLoader = ({ fadeOut = false }: IPreLoaderProps) => {
  return (
    <div className={`${styles.overlay} ${fadeOut ? styles.fadeOut : ""}`}>
      <div className={styles.content}>
        <img
          src={preloaderGif}
          alt="Loading..."
          className={styles.preloaderGif}
        />
        <p className={styles.loadingText}>Loading, please wait...</p>
      </div>
    </div>
  );
};

export { PreLoader };
