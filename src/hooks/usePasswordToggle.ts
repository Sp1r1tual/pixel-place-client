import { useState } from "react";

const usePasswordToggle = (initialValues: string[] = ["", ""]) => {
  const [passwords, setPasswords] = useState<string[]>(initialValues);
  const [showPasswords, setShowPasswords] = useState<boolean[]>(
    initialValues.map(() => false),
  );

  const handlePasswordChange =
    (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const newPasswords = [...passwords];
      newPasswords[index] = e.target.value;
      setPasswords(newPasswords);
    };

  const toggleShowPassword = (index: number) => {
    const newShow = [...showPasswords];
    newShow[index] = !newShow[index];
    setShowPasswords(newShow);
  };

  const shouldShowToggle = (index: number): boolean => !!passwords[index];

  const getShowPassword = (index: number): boolean => !!showPasswords[index];

  return {
    passwords,
    handlePasswordChange,
    toggleShowPassword,
    shouldShowToggle,
    getShowPassword,
  };
};

export { usePasswordToggle };
