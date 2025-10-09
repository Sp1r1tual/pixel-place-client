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
    clearError,
  } = useFormValidation();

  const navigate = useNavigate();

  const handleRegistration = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email")?.toString() || "";
    const password = formData.get("password")?.toString() || "";
    const passwordConfirm = formData.get("passwordConfirm")?.toString() || "";

    if (
      !validateEmail(email) ||
      !validatePassword(password) ||
      !validateConfirmPassword(password, passwordConfirm)
    )
      return;

    const result = await registration({ email, password });

    if (result) {
      navigate("/login", { replace: true });
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
        />
      </div>

      <div className={styles.formRow}>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          onChange={handleInputChange}
        />
      </div>

      <div className={styles.formRow}>
        <label htmlFor="passwordConfirm">Confirm Password</label>
        <input
          id="passwordConfirm"
          name="passwordConfirm"
          type="password"
          onChange={handleInputChange}
        />
      </div>

      {error && <p className={styles.error}>{error}</p>}

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
