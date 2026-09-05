import { clsx } from "clsx";
import type { InputHTMLAttributes, SelectHTMLAttributes, ReactNode } from "react";

interface FieldWrapperProps {
  label: string;
  hint?: string;
  error?: string;
  id: string;
  children: ReactNode;
}

function FieldWrapper({ label, hint, error, id, children }: FieldWrapperProps) {
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      {children}
      {hint && !error && <p className="hint">{hint}</p>}
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
  id: string;
}

export function Input({ label, hint, error, id, className, ...rest }: TextInputProps) {
  return (
    <FieldWrapper label={label} hint={hint} error={error} id={id}>
      <input id={id} className={clsx("input", className)} {...rest} />
    </FieldWrapper>
  );
}

interface SelectInputProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  hint?: string;
  error?: string;
  id: string;
  children: ReactNode;
}

export function Select({ label, hint, error, id, className, children, ...rest }: SelectInputProps) {
  return (
    <FieldWrapper label={label} hint={hint} error={error} id={id}>
      <select id={id} className={clsx("input", className)} {...rest}>
        {children}
      </select>
    </FieldWrapper>
  );
}
