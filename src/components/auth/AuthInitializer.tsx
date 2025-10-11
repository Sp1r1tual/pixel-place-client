import { useEffect, useState } from "react";

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

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          const newToken = await refreshToken();
          localStorage.setItem("token", newToken);
        } catch {
          setError("Session expired. Please login again");
          logout();
        }
      }

      setFadeOut(true);
      setTimeout(() => setReady(true), 500);
    };

    verifyToken();
  }, [logout, setError]);

  if (!ready) return <PreLoader fadeOut={fadeOut} />;

  return <>{children}</>;
};

export { AuthInitializer };
