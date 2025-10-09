import { useState, ReactNode, useRef, useEffect } from "react";

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
  className,
  menuClassName,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (ref.current && !ref.current.contains(event.target as Node)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={`${styles.dropdown} ${className || ""}`} ref={ref}>
      <div className={styles.trigger} onClick={() => setOpen(!open)}>
        {trigger}
      </div>
      {open && (
        <div className={`${styles.menu} ${menuClassName || ""}`}>
          {children}
        </div>
      )}
    </div>
  );
};

export { Dropdown };
