/**
 * Predefined amenity list for venue amenities.
 * Centralized here so both the form and any future display logic
 * reference the same controlled vocabulary.
 */

export const AMENITIES = [
  "Artificial Turf",
  "Changing Room",
  "Drinking Water",
  "First Aid",
  "Flood Lights",
  "Food Court",
  "Locker Room",
  "Parking",
  "Power Backup",
  "Rental Equipment",
  "Seating Lounge",
  "Showers",
  "Sports Shop",
  "Walking Track",
  "Warm-Up Area",
  "Washroom Available",
] as const;

export type Amenity = (typeof AMENITIES)[number];

export function isValidAmenity(value: string): value is Amenity {
  return (AMENITIES as readonly string[]).includes(value);
}