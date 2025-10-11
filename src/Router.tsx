import { createBrowserRouter } from "react-router-dom";

import App from "./App";
import { LoginPage } from "./pages/LoginPage";
import { RegistrationPage } from "./pages/RegistrationPage";
import { AuthorizationLayout } from "./layouts/AuthorizationLayout";
import { AuthenticatedLayout } from "./layouts/AuthenticatedLayout";
import { PageLayout } from "./layouts/PageLayout";
import { MainPage } from "./pages/MainPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";

const Router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        element: <AuthorizationLayout />,
        children: [
          { path: "login", element: <LoginPage /> },
          { path: "registration", element: <RegistrationPage /> },
          { path: "forgot-password", element: <ForgotPasswordPage /> },
          { path: "reset-password/:token", element: <ResetPasswordPage /> },
        ],
      },

      {
        element: <AuthenticatedLayout />,
        children: [
          {
            index: true,
            element: (
              <PageLayout>
                <MainPage />
              </PageLayout>
            ),
          },
        ],
      },
    ],
  },
]);

export { Router };
