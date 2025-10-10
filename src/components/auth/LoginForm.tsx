import { useNavigate, Link } from "react-router-dom";

import { useAuthStore } from "@/store/useAuthStore";
import { useFormValidation } from "@/hooks/useFormValidation";

import { SubmitBtn } from "../ui/SubmitBtn";

import styles from "./styles/LoginForm.module.css";

const LoginForm = () => {
  const { login, isLoading, error } = useAuthStore();
  const { validateEmail, validatePassword, clearError } = useFormValidation();

  const navigate = useNavigate();

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email")?.toString() || "";
    const password = formData.get("password")?.toString() || "";

    if (!validateEmail(email) || !validatePassword(password)) return;

    const result = await login({ email, password });

    if (result) {
      navigate("/", { replace: true });
    }
  };

  const handleInputChange = () => clearError();

  return (
    <form id="loginForm" className={styles.loginForm} onSubmit={handleLogin}>
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

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.submitBtn}>
        <SubmitBtn text="Login" isLoading={isLoading} form="loginForm" />
      </div>

      <p className={styles.registerLink}>
        <span>Do not have an account? </span>
        <Link to="/registration" className={styles.link} onClick={clearError}>
          Register here!
        </Link>
      </p>

      <p className={styles.registerLink}>
        <span>Forgot your password? </span>
        <Link
          to="/forgot-password"
          className={styles.link}
          onClick={clearError}
        >
          Restore access here
        </Link>
      </p>
    </form>
  );
};

export { LoginForm };
