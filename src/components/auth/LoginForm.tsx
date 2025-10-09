import { useAuthStore } from "@/store/useAuthStore";
import { useFormValidation } from "@/hooks/useFormValidation";

import { SubmitBtn } from "../ui/SubmitBtn";

import styles from "./styles/LoginForm.module.css";

const LoginForm = () => {
  const { login, isLoading, error } = useAuthStore();
  const { validateEmail, validatePassword, clearError } = useFormValidation();

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email")?.toString() || "";
    const password = formData.get("password")?.toString() || "";

    if (!validateEmail(email) || !validatePassword(password)) return;

    await login({ email, password });
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
    </form>
  );
};

export { LoginForm };
