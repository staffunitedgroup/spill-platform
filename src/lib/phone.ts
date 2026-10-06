import { isSupportedCountry, parsePhoneNumberFromString } from "libphonenumber-js";

/**
 * Number + the country picked next to it → "+84 901 234 567".
 * A number typed with its own "+code" wins over the picker; a leading 0 works too.
 * Returns null for an empty number, "invalid" when it can't be a real number.
 */
export function normalizePhone(raw: string | undefined, country: string | undefined): string | null | "invalid" {
  if (!raw?.trim()) return null;
  const region = country && isSupportedCountry(country) ? country : "VN";
  const parsed = parsePhoneNumberFromString(raw, region);
  if (!parsed?.isPossible()) return "invalid";
  return parsed.formatInternational();
}
