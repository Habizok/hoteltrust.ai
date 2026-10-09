import { de } from "./content/de";

export const SITE = {
  name: "HotelTrust",
  url: "https://hoteltrust.at",
} as const;

export const POSITION_KEYS = [
  "pos.koch",
  "pos.kueche",
  "pos.service",
  "pos.fruehstueck",
  "pos.rezeption",
  "pos.housekeeping",
  "pos.bar",
  "pos.technik",
  "pos.other",
] as const;

export const START_KEYS = ["opt.start.1", "opt.start.2", "opt.start.3", "opt.start.4", "opt.start.5", "opt.start.6"] as const;
export const ACC_KEYS = ["opt.acc.1", "opt.acc.2", "opt.acc.3"] as const;
export const GER_KEYS = ["opt.ger.1", "opt.ger.2", "opt.ger.3"] as const;

// Gespeichert und geprüft werden immer die deutschen Werte.
export const POSITIONS = POSITION_KEYS.map((k) => de[k]) as string[];
export const START_OPTIONS = START_KEYS.map((k) => de[k]) as string[];
export const ACCOMMODATION = ACC_KEYS.map((k) => de[k]) as string[];
export const GERMAN_LEVELS = GER_KEYS.map((k) => de[k]) as string[];

export const STATES = [
  "Tirol",
  "Salzburg",
  "Vorarlberg",
  "Kärnten",
  "Steiermark",
  "Oberösterreich",
  "Niederösterreich",
  "Wien",
  "Burgenland",
];
