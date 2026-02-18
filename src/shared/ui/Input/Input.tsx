import type { InputHTMLAttributes } from "react";
import styles from "./Input.module.scss";

type InputProps = {
  label?: string;
  error?: string;
  className?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "className">;

export const Input = ({ label, error, className, id, ...rest }: InputProps) => {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div
      className={[styles.field, error ? styles.isError : "", className]
        .filter(Boolean)
        .join(" ")}
    >
      {label ? (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      ) : null}
      <input id={inputId} className={styles.input} {...rest} />
      {error ? <span className={styles.error}>{error}</span> : null}
    </div>
  );
};
