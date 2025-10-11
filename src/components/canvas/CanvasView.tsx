import { Canvas } from "./Canvas";

import styles from "./styles/CanvasView.module.css";

const CanvasView = () => {
  return (
    <div className={styles.canvasWrapper}>
      <div className={styles.canvasContainer}>
        <Canvas />
      </div>
    </div>
  );
};

export { CanvasView };
