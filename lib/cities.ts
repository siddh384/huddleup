export const CITIES = ["Vadodara", "Ahmedabad", "Gandhinagar", "Surat"] as const;

export type City = (typeof CITIES)[number];

export function isValidCity(value: string): value is City {
  return (CITIES as readonly string[]).includes(value);
}
