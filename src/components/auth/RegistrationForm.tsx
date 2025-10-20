import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useFormValidation } from "@/hooks/useFormValidation";
import { useAuthStore } from "@/store/useAuthStore";

import { SubmitBtn } from "../ui/SubmitBtn";
import { Header } from "../ui/Header";

import styles from "./styles/RegistrationForm.module.css";

const RegistrationForm = () => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { registration, isLoading, error } = useAuthStore();
  const {
    validateEmail,
    validatePassword,
    validateConfirmPassword,
    fieldErrors,
    clearError,
  } = useFormValidation();

  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleRegistration = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email")?.toString() || "";
    const password = formData.get("password")?.toString() || "";
    const passwordConfirm = formData.get("passwordConfirm")?.toString() || "";

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmValid = validateConfirmPassword(password, passwordConfirm);

    if (!isEmailValid || !isPasswordValid || !isConfirmValid) return;

    const result = await registration({ email, password });

    if (result) {
      setSuccessMessage(t("auth.registration.success-message"));
      setTimeout(() => navigate("/login", { replace: true }), 5000);
    }
  };

  const handleInputChange = () => clearError();

  return (
    <form
      id="registrationForm"
      className={styles.registrationForm}
      autoComplete="off"
      onSubmit={handleRegistration}
    >
      <Header title={t("auth.registration.title")} color="#2764EB" />

      <div className={styles.formRow}>
        <label htmlFor="email">{t("auth.registration.email")}</label>
        <input
          id="email"
          name="email"
          type="text"
          onChange={handleInputChange}
          className={fieldErrors.email ? styles.errorInput : ""}
        />
      </div>

      <div className={styles.formRow}>
        <label htmlFor="password">{t("auth.registration.password")}</label>
        <input
          id="password"
          name="password"
          type="password"
          onChange={handleInputChange}
          className={fieldErrors.password ? styles.errorInput : ""}
        />
      </div>

      <div className={styles.formRow}>
        <label htmlFor="passwordConfirm">
          {t("auth.registration.password-confirm")}
        </label>
        <input
          id="passwordConfirm"
          name="passwordConfirm"
          type="password"
          onChange={handleInputChange}
          className={fieldErrors.passwordConfirm ? styles.errorInput : ""}
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
          text={t("auth.registration.button")}
          isLoading={isLoading}
          form="registrationForm"
        />
      </div>

      <p className={styles.registerLink}>
        <span>{t("auth.registration.have-account")}</span>
        <Link to="/login" className={styles.link} onClick={clearError}>
          {t("auth.registration.login-here")}
        </Link>
      </p>
    </form>
  );
};

export { RegistrationForm };
