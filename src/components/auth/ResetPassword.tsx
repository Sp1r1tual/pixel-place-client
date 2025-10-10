import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useFormValidation } from "@/hooks/useFormValidation";
import { useAuthStore } from "@/store/useAuthStore";

import { SubmitBtn } from "../ui/SubmitBtn";

import styles from "./styles/ResetPassword.module.css";

const ResetPassword = () => {
  const [successMsg, setSuccessMsg] = useState("");
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
    setSuccessMsg("");

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
      setSuccessMsg("Password changed successfully. Redirecting to login...");
      setTimeout(() => navigate("/login", { replace: true }), 3000);
    }
  };

  const handleInputChange = () => clearError();

  return (
    <form id="resetPassword" onSubmit={handleResetPassword}>
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

      {error && <p className={styles.error}>{error}</p>}

      {successMsg && <p className="text-green-500 text-sm">{successMsg}</p>}

      <SubmitBtn
        text="Change password"
        isLoading={isLoading}
        form="resetPassword"
      />
    </form>
  );
};

export { ResetPassword };
