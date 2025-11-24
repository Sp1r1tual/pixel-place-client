import {
  ReactNode,
  useRef,
  useEffect,
  cloneElement,
  Children,
  isValidElement,
  ReactElement,
  MouseEventHandler,
  useCallback,
} from "react";

import styles from "./styles/Dropdown.module.css";

interface IDropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  className?: string;
  menuClassName?: string | undefined;
  isOpen?: boolean | undefined;
  onToggle?: (() => void) | undefined;
}

const Dropdown: React.FC<IDropdownProps> = ({
  trigger,
  children,
  className = "",
  menuClassName = "",
  isOpen,
  onToggle,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isControlled = typeof isOpen === "boolean";

  const open = isControlled ? isOpen : false;

  const handleClickOutside = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        if (onToggle) {
          onToggle();
        }
      }
    },
    [onToggle],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (onToggle) {
          onToggle();
        }
      }
    },
    [onToggle],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside, {
        passive: true,
      });
      document.addEventListener("keydown", handleKeyDown);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("touchstart", handleClickOutside);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [open, handleClickOutside, handleKeyDown]);

  const toggleOpen = () => {
    if (onToggle) {
      onToggle();
    }
  };

  return (
    <div className={`${styles.dropdown} ${className}`} ref={ref}>
      <div className={styles.trigger} onClick={toggleOpen}>
        {trigger}
      </div>

      <div
        className={`${styles.menu} ${menuClassName || ""} ${open ? styles.show : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {Children.map(children, (child) => {
          if (!isValidElement(child)) return child;

          const typedChild = child as ReactElement<{
            onClick?: MouseEventHandler;
          }>;

          return cloneElement(typedChild, {
            onClick: (e: React.MouseEvent<HTMLElement>) => {
              typedChild.props.onClick?.(e);
              if (onToggle) {
                onToggle();
              }
            },
          });
        })}
      </div>
    </div>
  );
};

export { Dropdown };
