import type { SelectHTMLAttributes } from "react";
import styles from "./Select.module.scss";

type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = {
  label?: string;
  options: SelectOption[];
  className?: string;
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, "className">;

export const Select = ({
  label,
  options,
  className,
  id,
  ...rest
}: SelectProps) => {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={[styles.field, className].filter(Boolean).join(" ")}>
      {label ? (
        <label htmlFor={selectId} className={styles.label}>
          {label}
        </label>
      ) : null}
      <select id={selectId} className={styles.select} {...rest}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export type { SelectOption };
