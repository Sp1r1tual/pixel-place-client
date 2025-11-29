import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import { ErrorBoundaryWrapper } from "./components/errors/ErrorBoundaryWrapper";

import "react-toastify/dist/ReactToastify.css";
import styles from "./App.module.css";

const App = () => {
  return (
    <ErrorBoundaryWrapper>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        className={styles.toastContainer as string}
      />

      <Outlet />
    </ErrorBoundaryWrapper>
  );
};

export default App;
