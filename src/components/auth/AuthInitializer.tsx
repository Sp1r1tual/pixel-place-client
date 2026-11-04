import { useEffect, useRef, useState } from "react";

import { useAuthStore } from "@/store/useAuthStore";

import {
  isAuthFailure,
  refreshToken,
} from "@/api/interceptors/authInterceptors";
import { SystemService } from "@/services/systemService";

import { PreLoader } from "../ui/Preloader";

interface AuthInitializerProps {
  children: React.ReactNode;
}

const AuthInitializer = ({ children }: AuthInitializerProps) => {
  const setError = useAuthStore((state) => state.setError);
  const [ready, setReady] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const hasStarted = useRef(false);

  useEffect(() => {
    // One startup check per page load, also under StrictMode double effects.
    if (hasStarted.current) return;
    hasStarted.current = true;

    const verifyToken = async () => {
      // Only wakes a sleeping host; the app must still open if this fails.
      await SystemService.wakeUp().catch((err) =>
        console.warn("[Auth] Wake-up ping failed:", err),
      );

      if (localStorage.getItem("token")) {
        try {
          await refreshToken();
        } catch (err) {
          // An unreachable API says nothing about the session, so it is kept.
          if (isAuthFailure(err)) setError("errors.session-expired");
        }
      }

      setFadeOut(true);
      setTimeout(() => setReady(true), 500);
    };

    void verifyToken();
  }, [setError]);

  if (!ready) return <PreLoader fadeOut={fadeOut} />;

  return <>{children}</>;
};

export { AuthInitializer };
