import { useState } from "react";

import { useAuthStore } from "@/store/useAuthStore";

import { AUTH_ERRORS } from "@/utils/errors/errorMessages";
import {
  validateEmail as vEmail,
  validatePassword as vPassword,
  validateConfirmPassword as vConfirmPassword,
} from "@/utils/validations/formValidators";

interface IFieldErrors {
  email?: boolean;
  password?: boolean;
  passwordConfirm?: boolean;
}

const useFormValidation = () => {
  const { setError } = useAuthStore();
  const [fieldErrors, setFieldErrors] = useState<IFieldErrors>({});

  const setFieldError = (field: keyof IFieldErrors, value: boolean) => {
    setFieldErrors((prev) => ({ ...prev, [field]: value }));
  };

  const checkEmpty = (value: string, field: keyof IFieldErrors) => {
    if (!value.trim()) {
      setError(AUTH_ERRORS.fillAllFields);
      setFieldError(field, true);
      return false;
    }
    setFieldError(field, false);
    return true;
  };

  const validateEmail = (email: string) => {
    if (!checkEmpty(email, "email")) return false;
    if (!vEmail(email)) {
      setError(AUTH_ERRORS.invalidEmail);
      setFieldError("email", true);
      return false;
    }
    setFieldError("email", false);
    return true;
  };

  const validatePassword = (password: string) => {
    if (!checkEmpty(password, "password")) return false;
    if (!vPassword(password)) {
      setError(AUTH_ERRORS.invalidPassword);
      setFieldError("password", true);
      return false;
    }
    setFieldError("password", false);
    return true;
  };

  const validateConfirmPassword = (
    password: string,
    confirmPassword: string,
  ) => {
    if (!checkEmpty(confirmPassword, "passwordConfirm")) return false;
    if (!vConfirmPassword(password, confirmPassword)) {
      setError(AUTH_ERRORS.passwordsNotMatch);
      setFieldError("passwordConfirm", true);
      return false;
    }
    setFieldError("passwordConfirm", false);
    return true;
  };

  const clearError = () => {
    setError(null);
    setFieldErrors({});
  };

  return {
    fieldErrors,
    validateEmail,
    validatePassword,
    validateConfirmPassword,
    clearError,
  };
};

export { useFormValidation };
