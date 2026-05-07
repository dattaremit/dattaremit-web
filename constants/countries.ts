export interface Country {
  code: string;
  name: string;
  dial: string;
}

export function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 0x1f1e6 + char.charCodeAt(0) - 65);
  return String.fromCodePoint(...codePoints);
}

export const DEFAULT_COUNTRY_CODE = "US";

export const COUNTRIES: Country[] = [{ code: "US", name: "United States", dial: "+1" }];
