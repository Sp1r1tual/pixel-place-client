import { useState } from "react";
import { NavLink } from "react-router-dom";

import { useUserInterface } from "@/store/useUserInterface";

import { Dropdown } from "../ui/Dropdown";
import { DropdownBtn } from "../ui/DropdownBtn";

import pixelPlacePng from "@/assets/pixel-place-logo.png";
import logoutSvg from "@/assets/logout-svgrepo-com.svg";
import userSvg from "@/assets/user-circle-svgrepo-com.svg";
import burgerSvg from "@/assets/burger-menu-svgrepo-com.svg";

import styles from "./styles/Navbar.module.css";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const { isHidden } = useUserInterface();

  const toggleMobileMenu = () => setMobileOpen((prev) => !prev);
  const closeMenu = () => setMobileOpen(false);

  const handleUserMenuClick = () => {
    closeMenu();
  };

  if (isHidden) return null;

  return (
    <nav className={styles.navbar}>
      <img className={styles.logoImg} src={pixelPlacePng} alt="logo" />
      <a className={styles.title}>Pixel Place</a>

      <div className={styles.desktopMenu}>
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? styles.active : "")}
          onClick={closeMenu}
        >
          Main
        </NavLink>

        <NavLink
          to="/shop"
          className={({ isActive }) => (isActive ? styles.active : "")}
          onClick={closeMenu}
        >
          Shop
        </NavLink>
      </div>

      <Dropdown
        trigger={
          <img
            src={userSvg}
            alt="User menu"
            className={styles.userIcon}
            onClick={handleUserMenuClick}
          />
        }
        menuClassName={styles.menu}
      >
        <DropdownBtn
          text="Logout"
          icon={logoutSvg}
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
          className={styles.dropdownBtn}
        />
      </Dropdown>

      <div className={styles.burgerMenu} onClick={toggleMobileMenu}>
        <img src={burgerSvg} alt="Menu" />
      </div>

      {mobileOpen && (
        <div className={styles.mobileMenu}>
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? styles.active : "")}
            onClick={closeMenu}
          >
            Main
          </NavLink>

          <NavLink
            to="/shop"
            className={({ isActive }) => (isActive ? styles.active : "")}
            onClick={closeMenu}
          >
            Shop
          </NavLink>
        </div>
      )}
    </nav>
  );
};

export { Navbar };
