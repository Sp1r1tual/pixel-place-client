import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useAuthStore } from "@/store/useAuthStore";
import { useFormValidation } from "@/hooks/useFormValidation";

import { SubmitBtn } from "../ui/SubmitBtn";
import { Header } from "../ui/Header";
import { PasswordToggleBtn } from "../ui/PasswordToggleBtn";

import styles from "./styles/LoginForm.module.css";

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);

  const { login, isLoading, error } = useAuthStore();
  const { validateEmail, validatePassword, fieldErrors, clearError } =
    useFormValidation();

  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email")?.toString() || "";
    const password = formData.get("password")?.toString() || "";

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) return;

    const result = await login({ email, password });

    if (result) {
      navigate("/", { replace: true });
    }
  };

  const handleInputChange = () => clearError();

  return (
    <form
      id="loginForm"
      className={styles.loginForm}
      autoComplete="off"
      onSubmit={handleLogin}
    >
      <Header title={t("auth.login.title")} color="#2764EB" />

      <div className={styles.formRow}>
        <label htmlFor="email">{t("auth.login.email")}</label>
        <input
          id="email"
          name="email"
          type="text"
          onChange={handleInputChange}
          className={fieldErrors.email ? styles.errorInput : ""}
        />
      </div>

      <div className={styles.formRow}>
        <label htmlFor="password">{t("auth.login.password")}</label>
        <div className={styles.passwordWrapper}>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            onChange={handleInputChange}
            className={fieldErrors.password ? styles.errorInput : ""}
          />
          <PasswordToggleBtn
            passwordVisible={showPassword}
            setPasswordVisible={setShowPassword}
          />
        </div>
      </div>

      <div className={`${styles.errorWrapper} ${error ? styles.active : ""}`}>
        {error && <p className={styles.error}>{t(error)}</p>}
      </div>

      <div className={styles.submitBtn}>
        <SubmitBtn
          text={t("auth.login.button")}
          isLoading={isLoading}
          form="loginForm"
        />
      </div>

      <div className={styles.linkGroup}>
        <p className={styles.loginLink}>
          <span>{t("auth.login.no-account")}</span>
          <Link to="/registration" className={styles.link} onClick={clearError}>
            {t("auth.login.register-here")}
          </Link>
        </p>

        <p className={styles.loginLink}>
          <span>{t("auth.login.forgot-password")}</span>
          <Link
            to="/forgot-password"
            className={styles.link}
            onClick={clearError}
          >
            {t("auth.login.restore-here")}
          </Link>
        </p>
      </div>
    </form>
  );
};

export { LoginForm };
