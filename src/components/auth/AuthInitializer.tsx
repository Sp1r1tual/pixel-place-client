import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { useAuthStore } from "@/store/useAuthStore";

import { refreshToken } from "@/api/interceptors/authInterceptors";

import { PreLoader } from "../ui/Preloader";

interface AuthInitializerProps {
  children: React.ReactNode;
}

const AuthInitializer = ({ children }: AuthInitializerProps) => {
  const { setError, logout } = useAuthStore();
  const [ready, setReady] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  const { t } = useTranslation();

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          const newToken = await refreshToken();
          localStorage.setItem("token", newToken);
        } catch {
          setError(t("errors.session-expired"));
          logout();
        }
      }

      setFadeOut(true);
      setTimeout(() => setReady(true), 500);
    };

    verifyToken();
  }, [logout, setError, t]);

  if (!ready) return <PreLoader fadeOut={fadeOut} />;

  return <>{children}</>;
};

export { AuthInitializer };
