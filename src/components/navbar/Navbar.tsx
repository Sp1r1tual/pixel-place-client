import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useUserInterface } from "@/store/useUserInterface";
import { useSettingsStore } from "@/store/useSettingsStore";

import { Dropdown } from "../ui/Dropdown";
import { DropdownBtn } from "../ui/DropdownBtn";

import pixelPlacePng from "@/assets/pixel-place-logo.png";
import settingsSvg from "@/assets/settings-svgrepo-com.svg";
import logoutSvg from "@/assets/logout-svgrepo-com.svg";
import userSvg from "@/assets/user-circle-svgrepo-com.svg";
import burgerSvg from "@/assets/burger-menu-svgrepo-com.svg";

import styles from "./styles/Navbar.module.css";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const { isHidden } = useUserInterface();
  const { toggleSettings } = useSettingsStore();

  const { t } = useTranslation();

  const toggleMobileMenu = () => setMobileOpen((prev) => !prev);
  const closeMenu = () => setMobileOpen(false);

  if (isHidden) return null;

  return (
    <nav className={styles.navbar}>
      <img className={styles.logoImg} src={pixelPlacePng} alt="logo" />
      <a className={styles.title}>{t("navbar.header")}</a>

      <div className={styles.desktopMenu}>
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? styles.active : "")}
          onClick={closeMenu}
        >
          {t("navbar.main")}
        </NavLink>

        <NavLink
          to="/shop"
          className={({ isActive }) => (isActive ? styles.active : "")}
          onClick={closeMenu}
        >
          {t("navbar.shop")}
        </NavLink>
      </div>

      <Dropdown
        trigger={
          <img src={userSvg} alt="User menu" className={styles.userIcon} />
        }
        menuClassName={styles.menu}
      >
        <DropdownBtn
          text={t("navbar.dropdown.settings")}
          icon={settingsSvg}
          onClick={toggleSettings}
          className={styles.dropdownBtn}
        />

        <DropdownBtn
          text={t("navbar.dropdown.logout")}
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
            {t("navbar.main")}
          </NavLink>

          <NavLink
            to="/shop"
            className={({ isActive }) => (isActive ? styles.active : "")}
            onClick={closeMenu}
          >
            {t("navbar.shop")}
          </NavLink>
        </div>
      )}
    </nav>
  );
};

export { Navbar };
