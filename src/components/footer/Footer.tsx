import { CONTACTS } from "@/data/contacts";

import styles from "./styles/Footer.module.css";

const Footer = () => {
  const mail = CONTACTS.email;

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.copyright}>
          © {new Date().getFullYear()}{" "}
          <a href="/" className={styles.link}>
            Pixel Place
          </a>
        </div>

        <div className={styles.linkGroup}>
          <a
            href="https://github.com/Sp1r1tual/questanizer-pet-project"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            About us
          </a>
          <a href={`mailto:${mail}`} className={styles.link}>
            Contact us
          </a>
        </div>
      </div>
    </footer>
  );
};

export { Footer };
