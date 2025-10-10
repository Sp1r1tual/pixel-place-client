import { useState } from "react";

import { useFormValidation } from "@/hooks/useFormValidation";
import { useAuthStore } from "@/store/useAuthStore";

import { SubmitBtn } from "../ui/SubmitBtn";

import styles from "./styles/ForgotPassword.module.css";

const ForgotPassword = () => {
  const { validateEmail, clearError, fieldErrors } = useFormValidation();
  const { requestPasswordReset, isLoading, error, setError } = useAuthStore();
  const [successMsg, setSuccessMsg] = useState("");

  const requestResetPassword = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setError(null);
    setSuccessMsg("");

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email")?.toString() || "";

    if (!validateEmail(email)) return;

    const success = await requestPasswordReset(email);

    if (success) {
      setSuccessMsg("A password reset link has been sent to your email");
    }
  };

  const handleInputChange = () => clearError();

  return (
    <form id="forgotPassword" onSubmit={requestResetPassword}>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        name="email"
        type="text"
        onChange={handleInputChange}
        className={fieldErrors.email ? styles.errorInput : ""}
      />

      {error && <p className={styles.error}>{error}</p>}

      {successMsg && <p className="text-green-500 text-sm">{successMsg}</p>}

      <SubmitBtn
        text="Send reset link"
        isLoading={isLoading}
        form="forgotPassword"
      />
    </form>
  );
};

export { ForgotPassword };
