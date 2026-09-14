import { useId, type InputHTMLAttributes } from "react";

type AuthInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function AuthInput({ label, error, id, className, ...props }: AuthInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-semibold text-brand-navy">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`mt-1.5 block w-full rounded-lg border px-3.5 py-2 text-base text-brand-navy placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
          error
            ? "border-red-400 focus:ring-red-200"
            : "border-neutral-300 focus:border-brand-gold focus:ring-brand-gold/25"
        } ${className ?? ""}`}
        {...props}
      />
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
