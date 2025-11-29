import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useAuthStore } from "@/store/useAuthStore";
import { useFormValidation } from "@/hooks/useFormValidation";
import { usePasswordToggle } from "@/hooks/usePasswordToggle";

import { SubmitBtn } from "../ui/SubmitBtn";
import { PasswordToggleBtn } from "../ui/PasswordToggleBtn";
import { Header } from "../ui/Header";

import styles from "./styles/ResetPassword.module.css";

const ResetPassword = () => {
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const { resetPassword, isLoading, error, setError } = useAuthStore();
  const { validatePassword, validateConfirmPassword, clearError, fieldErrors } =
    useFormValidation();
  const {
    passwords,
    handlePasswordChange,
    toggleShowPassword,
    shouldShowToggle,
    getShowPassword,
  } = usePasswordToggle(["", ""]);

  const { token } = useParams<{ token: string }>();
  const { t } = useTranslation();

  const handleResetPassword = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage("");

    const formData = new FormData(event.currentTarget);
    const password = formData.get("password")?.toString() || "";
    const passwordConfirm = formData.get("confirmPassword")?.toString() || "";

    if (
      !validatePassword(password) ||
      !validateConfirmPassword(password, passwordConfirm)
    )
      return;

    if (!token) {
      setError(t("auth.reset-password.invalid-token"));
      return;
    }

    const success = await resetPassword(token, password);

    if (success) {
      setSuccessMessage(t("auth.reset-password.success-message"));
      setTimeout(() => navigate("/login", { replace: true }), 3000);
    }
  };

  const handleInputChange = () => {
    clearError();
  };

  return (
    <form
      id="resetPassword"
      className={styles.resetPasswordForm}
      autoComplete="off"
      onSubmit={handleResetPassword}
    >
      <Header title={t("auth.reset-password.title")} color="#2764EB" />

      <div className={styles.formRow}>
        <label htmlFor="password">{t("auth.reset-password.password")}</label>
        <div className={styles.passwordWrapper}>
          <input
            id="password"
            name="password"
            type={getShowPassword(0) ? "text" : "password"}
            value={passwords[0]}
            onChange={(e) => {
              handlePasswordChange(0)(e);
              handleInputChange();
            }}
            className={fieldErrors.password ? styles.errorInput : ""}
          />
          {shouldShowToggle(0) && (
            <PasswordToggleBtn
              passwordVisible={getShowPassword(0)}
              setPasswordVisible={() => toggleShowPassword(0)}
            />
          )}
        </div>
      </div>

      <div className={styles.formRow}>
        <label htmlFor="confirmPassword">
          {t("auth.reset-password.confirm-password")}
        </label>
        <div className={styles.passwordWrapper}>
          <input
            id="passwordConfirm"
            name="passwordConfirm"
            type={getShowPassword(1) ? "text" : "password"}
            value={passwords[1]}
            onChange={(e) => {
              handlePasswordChange(1)(e);
              handleInputChange();
            }}
            className={fieldErrors.passwordConfirm ? styles.errorInput : ""}
          />
          {shouldShowToggle(1) && (
            <PasswordToggleBtn
              passwordVisible={getShowPassword(1)}
              setPasswordVisible={() => toggleShowPassword(1)}
            />
          )}
        </div>
      </div>

      <div className={`${styles.errorWrapper} ${error ? styles.active : ""}`}>
        {error && <p className={styles.error}>{t(error)}</p>}
      </div>

      <div
        className={`${styles.successWrapper} ${successMessage ? styles.active : ""}`}
      >
        {successMessage && <p className={styles.success}>{successMessage}</p>}
      </div>

      <SubmitBtn
        text={t("auth.reset-password.button")}
        isLoading={isLoading}
        form="resetPassword"
      />
    </form>
  );
};

export { ResetPassword };
