import {
  useState,
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
  className?: string | undefined;
  menuClassName?: string | undefined;
}

const Dropdown: React.FC<IDropdownProps> = ({
  trigger,
  children,
  className = "",
  menuClassName = "",
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((event: MouseEvent | TouchEvent) => {
    if (ref.current && !ref.current.contains(event.target as Node)) {
      setOpen(false);
    }
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === "Escape") setOpen(false);
  }, []);

  useEffect(() => {
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
  }, [handleClickOutside, handleKeyDown]);

  const toggleOpen = () => setOpen((prev) => !prev);

  return (
    <div className={`${styles.dropdown} ${className}`} ref={ref}>
      <div className={styles.trigger} onClick={toggleOpen}>
        {trigger}
      </div>

      {open && (
        <div
          className={`${styles.menu} ${menuClassName}`}
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
                setOpen(false);
              },
            });
          })}
        </div>
      )}
    </div>
  );
};

export { Dropdown };
