import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useFormValidation } from "@/hooks/useFormValidation";
import { useAuthStore } from "@/store/useAuthStore";

import { SubmitBtn } from "../ui/SubmitBtn";
import { Header } from "../ui/Header";

import styles from "./styles/ResetPassword.module.css";

const ResetPassword = () => {
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const { resetPassword, isLoading, error, setError } = useAuthStore();
  const { validatePassword, validateConfirmPassword, clearError, fieldErrors } =
    useFormValidation();

  const { token } = useParams<{ token: string }>();

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
      setError("Invalid or missing reset token");
      return;
    }

    const success = await resetPassword(token, password);

    if (success) {
      setSuccessMessage(
        "Password changed successfully. Redirecting to login...",
      );
      setTimeout(() => navigate("/login", { replace: true }), 3000);
    }
  };

  const handleInputChange = () => clearError();

  return (
    <form
      id="resetPassword"
      className={styles.resetPasswordForm}
      autoComplete="off"
      onSubmit={handleResetPassword}
    >
      <Header title="Change password" color="#2764EB" />

      <div className={styles.formRow}>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          onChange={handleInputChange}
          className={fieldErrors.password ? styles.errorInput : ""}
        />
      </div>

      <div className={styles.formRow}>
        <label htmlFor="confirmPassword">Confirm password</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          onChange={handleInputChange}
          className={fieldErrors.passwordConfirm ? styles.errorInput : ""}
        />
      </div>

      <div className={`${styles.errorWrapper} ${error ? styles.active : ""}`}>
        {error && <p className={styles.error}>{error}</p>}
      </div>

      <div
        className={`${styles.successWrapper} ${successMessage ? styles.active : ""}`}
      >
        {successMessage && <p className={styles.success}>{successMessage}</p>}
      </div>

      <SubmitBtn
        text="Change password"
        isLoading={isLoading}
        form="resetPassword"
      />
    </form>
  );
};

export { ResetPassword };
