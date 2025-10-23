import { useTranslation } from "react-i18next";
import styles from "./styles/ConfirmChoiceModal.module.css";

interface ConfirmChoiceModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
  highlightConfirm?: boolean;
}

const ConfirmChoiceModal = ({
  isOpen,
  title,
  message,
  onConfirm,
  onClose,
  highlightConfirm = true,
}: ConfirmChoiceModalProps) => {
  const { t } = useTranslation();

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    <div
      className={`${styles.backdrop} ${isOpen ? styles.show : ""}`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-desc"
    >
      <div className={`${styles.modal} ${isOpen ? styles.show : ""}`}>
        <div className={styles.header}>
          <h3 id="confirm-modal-title" className={styles.title}>
            {title}
          </h3>
        </div>

        <div className={styles.body}>
          <p id="confirm-modal-desc" className={styles.message}>
            {message}
          </p>
        </div>

        <div className={styles.footer}>
          <button
            className={`${styles.button} ${
              highlightConfirm ? styles.highlight : styles.confirmBtn
            }`}
            onClick={onConfirm}
          >
            {t("shared.yes")}
          </button>
          <button
            className={`${styles.button} ${
              !highlightConfirm ? styles.highlight : styles.cancelBtn
            }`}
            onClick={onClose}
          >
            {t("shared.no")}
          </button>
        </div>
      </div>
    </div>
  );
};

export { ConfirmChoiceModal };
