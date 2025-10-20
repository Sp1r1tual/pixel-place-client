import styles from "./styles/SubmitBtn.module.css";

interface ISubmitBtnProps {
  text: string;
  isLoading: boolean;
  form: string;
}

const SubmitBtn = ({ text, isLoading, form }: ISubmitBtnProps) => {
  return (
    <button
      type="submit"
      form={form}
      className={styles.submitBtn}
      disabled={isLoading}
    >
      {text}
    </button>
  );
};

export { SubmitBtn };
