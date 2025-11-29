import { useRef } from "react";
import {
  useRouteError,
  isRouteErrorResponse,
  useNavigate,
} from "react-router-dom";
import { useTranslation } from "react-i18next";

import { usePixelBackground } from "@/hooks/usePixelBackground";

import styles from "./styles/RouteErrorFallback.module.css";

const RouteErrorFallback = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  usePixelBackground({ canvasRef });

  const error = useRouteError();
  const navigate = useNavigate();

  const { t } = useTranslation();

  let message;

  if (isRouteErrorResponse(error)) {
    message = `${error.status} ${error.statusText}`;
  } else if (error instanceof Error) {
    message = error.message;
  } else {
    message = "Unknown error";
  }

  return (
    <div className={styles.errorWrapper}>
      <canvas ref={canvasRef} className={styles.backgroundCanvas} />

      <div role="alert" className={styles.errorAlert}>
        <p className={styles.errorText}>{t("errors.something-went-wrong")}:</p>
        <pre className={styles.errorMessage}>{message}</pre>

        <button onClick={() => navigate("/")} className={styles.button}>
          {t("shared.return-to-home")}
        </button>
      </div>
    </div>
  );
};

export { RouteErrorFallback };
