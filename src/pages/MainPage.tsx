import { useUserInterface } from "@/store/useUserInterface";

import { CanvasView } from "@/components/canvas/CanvasView";
import { InterfaceBtn } from "@/components/ui/InterfaceBtn";

import showIntrfaceSvg from "@/assets/eye-visibility-visible-hide-hidden-show-watch-svgrepo-com.svg";

import styles from "./styles/MainPage.module.css";

const MainPage = () => {
  const { isHidden, toggleInterface } = useUserInterface();

  return (
    <div className={styles.mainPage}>
      <CanvasView />

      {isHidden && (
        <InterfaceBtn
          id="showInterface"
          imgDefault={showIntrfaceSvg}
          onClick={toggleInterface}
          className={styles.showInterfaceBtn}
        />
      )}
    </div>
  );
};

export { MainPage };
