import showPasswordSvg from "@/assets/eye-password-show-svgrepo-com.svg";
import hidePasswordSvg from "@/assets/hide-svgrepo-com.svg";

import styles from "./styles/PasswordToggleBtn.module.css";

interface IPasswordToggleBtnProps {
  passwordVisible: boolean;
  setPasswordVisible: (state: boolean) => void;
}

const PasswordToggleBtn = ({
  passwordVisible,
  setPasswordVisible,
}: IPasswordToggleBtnProps) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setPasswordVisible(!passwordVisible);
  };

  return (
    <button type="button" className={styles.toggleBtn} onClick={handleClick}>
      <img src={passwordVisible ? hidePasswordSvg : showPasswordSvg} />
    </button>
  );
};

export { PasswordToggleBtn };
