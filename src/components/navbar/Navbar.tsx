import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useUserInterface } from "@/store/useUserInterface";
import { useProfileStore } from "@/store/useProfileStore";
import { useSettingsStore } from "@/store/useSettingsStore";

import { Dropdown } from "../ui/Dropdown";
import { DropdownBtn } from "../ui/DropdownBtn";

import pixelPlacePng from "@/assets/pixel-place-logo.png";
import profileSvg from "@/assets/profile-round-svgrepo-com.svg";
import settingsSvg from "@/assets/settings-svgrepo-com.svg";
import logoutSvg from "@/assets/logout-svgrepo-com.svg";
import userSvg from "@/assets/user-circle-svgrepo-com.svg";
import burgerSvg from "@/assets/burger-menu-svgrepo-com.svg";

import styles from "./styles/Navbar.module.css";

interface INavbarProps {
  onLogout: () => void;
}

const Navbar = ({ onLogout }: INavbarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { isHidden } = useUserInterface();
  const { toggleProfile } = useProfileStore();
  const { toggleSettings } = useSettingsStore();
  const { t } = useTranslation();

  const toggleMobileMenu = () => {
    setMobileOpen((prev) => !prev);
    if (!mobileOpen) setDropdownOpen(false);
  };

  const handleDropdownToggle = () => {
    setDropdownOpen((prev) => !prev);
    if (!dropdownOpen) setMobileOpen(false);
  };

  const closeMobileMenu = () => setMobileOpen(false);

  if (isHidden) return null;

  return (
    <nav className={styles.navbar}>
      <img className={styles.logoImg} src={pixelPlacePng} alt="logo" />
      <span className={styles.title}>{t("navbar.header")}</span>

      <div className={styles.desktopMenu}>
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? styles.active : "")}
          onClick={closeMobileMenu}
        >
          {t("navbar.main")}
        </NavLink>
        <NavLink
          to="/shop"
          className={({ isActive }) => (isActive ? styles.active : "")}
          onClick={closeMobileMenu}
        >
          {t("navbar.shop")}
        </NavLink>
      </div>

      <div className={styles.navRight}>
        <Dropdown
          trigger={
            <img src={userSvg} alt="User menu" className={styles.userIcon} />
          }
          menuClassName={styles.menu}
          isOpen={dropdownOpen}
          onToggle={handleDropdownToggle}
        >
          <DropdownBtn
            text={t("navbar.dropdown.profile")}
            icon={profileSvg}
            onClick={toggleProfile}
            className={styles.dropdownBtn}
          />
          <DropdownBtn
            text={t("navbar.dropdown.settings")}
            icon={settingsSvg}
            onClick={toggleSettings}
            className={styles.dropdownBtn}
          />
          <DropdownBtn
            text={t("navbar.dropdown.logout")}
            icon={logoutSvg}
            onClick={onLogout}
            className={styles.dropdownBtn}
          />
        </Dropdown>

        <div className={styles.burgerMenu} onClick={toggleMobileMenu}>
          <img src={burgerSvg} alt="Menu" />
        </div>
      </div>

      {mobileOpen && (
        <div className={styles.mobileMenu}>
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? styles.active : "")}
            onClick={closeMobileMenu}
          >
            {t("navbar.main")}
          </NavLink>
          <NavLink
            to="/shop"
            className={({ isActive }) => (isActive ? styles.active : "")}
            onClick={closeMobileMenu}
          >
            {t("navbar.shop")}
          </NavLink>
        </div>
      )}
    </nav>
  );
};

export { Navbar };
