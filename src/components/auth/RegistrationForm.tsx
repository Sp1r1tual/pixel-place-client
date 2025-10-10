import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { useFormValidation } from "@/hooks/useFormValidation";
import { useAuthStore } from "@/store/useAuthStore";

import { SubmitBtn } from "../ui/SubmitBtn";

import styles from "./styles/RegistrationForm.module.css";

const RegistrationForm = () => {
  const { registration, isLoading, error } = useAuthStore();
  const {
    validateEmail,
    validatePassword,
    validateConfirmPassword,
    fieldErrors,
    clearError,
  } = useFormValidation();

  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
      setSuccessMessage("Activation link has been sent to your email 💌");
      setTimeout(() => navigate("/login", { replace: true }), 3000);
    }
  };

  const handleInputChange = () => clearError();

  return (
    <form
      id="registrationForm"
      className={styles.loginForm}
      onSubmit={handleRegistration}
    >
      <div className={styles.formRow}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="text"
          onChange={handleInputChange}
          className={fieldErrors.email ? styles.errorInput : ""}
        />
      </div>

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
        <label htmlFor="passwordConfirm">Confirm Password</label>
        <input
          id="passwordConfirm"
          name="passwordConfirm"
          type="password"
          onChange={handleInputChange}
          className={fieldErrors.passwordConfirm ? styles.errorInput : ""}
        />
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {successMessage && <p className={styles.success}>{successMessage}</p>}

      <div className={styles.submitBtn}>
        <SubmitBtn
          text="Register"
          isLoading={isLoading}
          form="registrationForm"
        />
      </div>

      <p className={styles.loginLink}>
        <span>Do you have an account? </span>
        <Link to="/login" className={styles.link} onClick={clearError}>
          Login here!
        </Link>
      </p>
    </form>
  );
};

export { RegistrationForm };
