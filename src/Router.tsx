import { createBrowserRouter } from "react-router-dom";

import App from "./App";
import { LoginPage } from "./pages/LoginPage";
import { RegistrationPage } from "./pages/RegistrationPage";
import { AuthenticatedLayout } from "./layouts/AuthenticatedLayout";
import { PageLayout } from "./layouts/PageLayout";
import { MainPage } from "./pages/MainPage";

const Router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "registration", element: <RegistrationPage /> },

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
