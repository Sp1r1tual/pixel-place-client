import { Navigate, Outlet } from "react-router-dom";

const AuthenticatedLayout = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export { AuthenticatedLayout };
