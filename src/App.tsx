import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import styles from "./App.module.css";

const App = () => {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        className={styles.toastContainer as string}
      />

      <Outlet />
    </>
  );
};

export default App;
