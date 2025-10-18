import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useFormValidation } from "@/hooks/useFormValidation";
import { useAuthStore } from "@/store/useAuthStore";

import { SubmitBtn } from "../ui/SubmitBtn";
import { Header } from "../ui/Header";

import styles from "./styles/ForgotPassword.module.css";

const ForgotPassword = () => {
  const [successMessage, setSuccessMessage] = useState("");

  const { validateEmail, clearError, fieldErrors } = useFormValidation();
  const { requestPasswordReset, isLoading, error, setError } = useAuthStore();

  const { t } = useTranslation();

  const requestResetPassword = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage("");

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email")?.toString() || "";

    if (!validateEmail(email)) return;

    const success = await requestPasswordReset(email);

    if (success) {
      setSuccessMessage(t("auth.forgot-password.success-message"));
    }
  };

  const handleInputChange = () => clearError();

  return (
    <form
      id="forgotPassword"
      className={styles.forgotPasswordForm}
      autoComplete="off"
      onSubmit={requestResetPassword}
    >
      <Header title={t("auth.forgot-password.title")} color="#2764EB" />

      <div className={styles.formRow}>
        <label htmlFor="email">{t("auth.forgot-password.email")}</label>
        <input
          id="email"
          name="email"
          type="text"
          onChange={handleInputChange}
          className={fieldErrors.email ? styles.errorInput : ""}
        />
      </div>

      <div className={`${styles.errorWrapper} ${error ? styles.active : ""}`}>
        {error && <p className={styles.error}>{t(error)}</p>}
      </div>

      <div
        className={`${styles.successWrapper} ${successMessage ? styles.active : ""}`}
      >
        {successMessage && <p className={styles.success}>{successMessage}</p>}
      </div>

      <div className={styles.submitBtn}>
        <SubmitBtn
          text={t("auth.forgot-password.button")}
          isLoading={isLoading}
          form="forgotPassword"
        />
      </div>

      <p className={styles.registerLink}>
        <Link to="/login" className={styles.link} onClick={clearError}>
          {t("auth.forgot-password.back-to-login")}
        </Link>
      </p>
    </form>
  );
};

export { ForgotPassword };
