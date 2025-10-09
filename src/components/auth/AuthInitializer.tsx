import { useEffect } from "react";

import { useAuthStore } from "@/store/useAuthStore";

import { refreshToken } from "@/api/interceptors/authInterceptors";

const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
  const { setError, logout } = useAuthStore();

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");

      if (!token) return;

      try {
        const newToken = await refreshToken();

        localStorage.setItem("token", newToken);
      } catch {
        setError("Session expired. Please login again.");
        logout();
      }
    };

    verifyToken();
  }, [logout, setError]);

  return <>{children}</>;
};

export { AuthInitializer };
