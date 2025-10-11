import { useRef } from "react";
import { Outlet } from "react-router-dom";

import { usePixelBackground } from "@/hooks/usePixelBackground";

import { Footer } from "@/components/footer/Footer";

import styles from "./styles/AuthorizationLayout.module.css";

const AuthorizationLayout = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  usePixelBackground({ canvasRef });

  return (
    <div className={styles.wrapper}>
      <canvas ref={canvasRef} className={styles.backgroundCanvas} />

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
