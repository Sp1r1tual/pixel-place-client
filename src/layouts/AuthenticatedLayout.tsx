import { useEffect } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";

const AuthenticatedLayout = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const handleRefreshFailed = () => {
      navigate("/login", { replace: true });
    };

    window.addEventListener("socket:refresh_failed", handleRefreshFailed);

    return () => {
      window.removeEventListener("socket:refresh_failed", handleRefreshFailed);
    };
  }, [navigate]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export { AuthenticatedLayout };
