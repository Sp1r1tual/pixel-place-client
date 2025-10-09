import { Dropdown } from "../ui/Dropdown";
import { DropdownBtn } from "../ui/DropdownBtn";

import logoutSvg from "@/assets/logout-svgrepo-com.svg";
import userSvg from "@/assets/user-circle-svgrepo-com.svg";

import styles from "./styles/Navbar.module.css";

const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      <h1 className={styles.title}>Pixel Place</h1>

      <Dropdown
        trigger={
          <img src={userSvg} alt="User menu" className={styles.userIcon} />
        }
        menuClassName={styles.menu} // якщо хочеш стилізувати саме меню Dropdown
      >
        <DropdownBtn
          text="Logout"
          icon={logoutSvg}
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
          className={styles.dropdownBtn} // додаткові стилі для кнопки
        />
      </Dropdown>
    </nav>
  );
};

export { Navbar };
