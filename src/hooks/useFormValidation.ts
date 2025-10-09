import { useAuthStore } from "@/store/useAuthStore";

import {
  validateEmail as vEmail,
  validatePassword as vPassword,
  validateConfirmPassword as vConfirmPassword,
} from "@/utils/validations/formValidators";

const useFormValidation = () => {
  const { setError } = useAuthStore();

  const validateEmail = (email: string) => {
    if (!vEmail(email)) {
      setError("Invalid email format");
      return false;
    }
    return true;
  };

  const validatePassword = (password: string) => {
    if (!vPassword(password)) {
      setError(
        "Password must be 8-32 characters, include an uppercase letter, and contain only allowed symbols",
      );
      return false;
    }
    return true;
  };

  const validateConfirmPassword = (
    password: string,
    confirmPassword: string,
  ) => {
    if (!vConfirmPassword(password, confirmPassword)) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const clearError = () => setError(null);

  return {
    validateEmail,
    validatePassword,
    validateConfirmPassword,
    clearError,
  };
};

export { useFormValidation };
