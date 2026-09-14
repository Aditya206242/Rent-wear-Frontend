"use client";

import { useId, useMemo, useState } from "react";
import {
  getCountries,
  getCountryCallingCode,
  isValidPhoneNumber,
  parsePhoneNumber,
  type CountryCode,
} from "libphonenumber-js";

type CountryOption = {
  code: CountryCode;
  callingCode: string;
  name: string;
  flag: string;
};

/** ISO 3166-1 alpha-2 -> Unicode regional indicator flag, e.g. "IN" -> 🇮🇳. */
function regionFlag(code: string): string {
  return code
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

const regionNames =
  typeof Intl !== "undefined" && "DisplayNames" in Intl
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : undefined;

/** Every calling-country libphonenumber-js knows about — no hand-maintained list. */
const COUNTRY_OPTIONS: CountryOption[] = getCountries()
  .map((code) => ({
    code,
    callingCode: getCountryCallingCode(code),
    name: regionNames?.of(code) ?? code,
    flag: regionFlag(code),
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

const DEFAULT_COUNTRY: CountryCode = "IN";
const FALLBACK_OPTION = COUNTRY_OPTIONS.find((c) => c.code === DEFAULT_COUNTRY) ?? COUNTRY_OPTIONS[0];

type PhoneInputProps = {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  /** ISO 3166-1 alpha-2, e.g. "IN". Defaults to India. */
  defaultCountry?: CountryCode;
  /** An E.164 string (e.g. "+919876543210") to prefill from, such as an echoed-back value. */
  defaultValue?: string;
};

export function PhoneInput({
  label,
  name,
  error,
  required,
  defaultCountry = DEFAULT_COUNTRY,
  defaultValue,
}: PhoneInputProps) {
  const generatedId = useId();
  const inputId = `phone-${generatedId}`;
  const errorId = `${inputId}-error`;

  const initial = useMemo(() => {
    if (defaultValue) {
      try {
        const parsed = parsePhoneNumber(defaultValue);
        if (parsed) {
          return { country: (parsed.country ?? defaultCountry) as CountryCode, digits: parsed.nationalNumber as string };
        }
      } catch {
        // Unparsable seed value — fall back to an empty field for the default country.
      }
    }
    return { country: defaultCountry, digits: "" };
  }, [defaultValue, defaultCountry]);

  const [country, setCountry] = useState<CountryCode>(initial.country);
  const [digits, setDigits] = useState(initial.digits);
  const [touched, setTouched] = useState(false);

  const selected = COUNTRY_OPTIONS.find((c) => c.code === country) ?? FALLBACK_OPTION;

  const isValid = digits.length > 0 && isValidPhoneNumber(digits, country);
  const localError =
    touched && digits.length > 0 && !isValid ? `Enter a valid phone number for ${selected.name}.` : undefined;
  const displayError = error ?? localError;

  // Normalize to E.164 for the actual field the form/server sees, using the library's
  // country-specific parsing (handles trunk prefixes etc.) rather than naive string concatenation.
  const e164Value = useMemo(() => {
    if (!digits) return "";
    try {
      return parsePhoneNumber(digits, country).number;
    } catch {
      return `+${selected.callingCode}${digits}`;
    }
  }, [digits, country, selected.callingCode]);

  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-semibold text-brand-navy">
        {label}
      </label>

      <div
        className={`mt-1.5 flex w-full overflow-hidden rounded-lg border focus-within:ring-2 focus-within:ring-offset-0 ${
          displayError
            ? "border-red-400 focus-within:ring-red-200"
            : "border-neutral-300 focus-within:border-brand-gold focus-within:ring-brand-gold/25"
        }`}
      >
        <div className="relative flex items-center border-r border-neutral-300 bg-neutral-50">
          <span className="pointer-events-none flex items-center gap-1.5 pl-3 pr-7 text-base text-brand-navy">
            <span aria-hidden="true">{selected.flag}</span>
            <span>+{selected.callingCode}</span>
          </span>
          <select
            aria-label="Country"
            value={country}
            onChange={(e) => {
              const next = e.target.value as CountryCode;
              setCountry(next);
              // A number typed for the previous country is meaningless under the new one.
              setDigits("");
              setTouched(false);
            }}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          >
            {COUNTRY_OPTIONS.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.name} (+{c.callingCode})
              </option>
            ))}
          </select>
        </div>

        <input
          id={inputId}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="9876543210"
          value={digits}
          required={required}
          aria-invalid={displayError ? true : undefined}
          aria-describedby={displayError ? errorId : undefined}
          onChange={(e) => setDigits(e.target.value.replace(/\D/g, ""))}
          onBlur={() => setTouched(true)}
          className="block w-full min-w-0 px-3.5 py-2 text-base text-brand-navy placeholder:text-neutral-400 focus:outline-none"
        />
      </div>

      <input type="hidden" name={name} value={e164Value} />

      {displayError && (
        <p id={errorId} role="alert" className="mt-1.5 text-sm text-red-600">
          {displayError}
        </p>
      )}
    </div>
  );
}
