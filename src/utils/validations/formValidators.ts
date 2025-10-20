const validateEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const validatePassword = (value: string): boolean =>
  value.length >= 8 &&
  value.length <= 16 &&
  /[A-Z]/.test(value) &&
  /^[A-Za-z0-9!@#$%^&*()_+\-=]+$/.test(value);

const validateConfirmPassword = (
  password: string,
  confirmPassword: string,
): boolean => password === confirmPassword;

export { validateEmail, validatePassword, validateConfirmPassword };
