/**
 * Domain types for Bandlik Portal.
 * The vacancy shape mirrors the Oson Ish (osonish.uz) taxonomy so a later
 * switch to a live data source needs no remodelling.
 */

export type Locale = "uz" | "ru";

/** A string that exists in both site languages. */
export type Localized = { uz: string; ru: string };

export type PaymentType = "monthly" | "piecework" | "hourly" | "contract";

export type EmploymentType =
  | "permanent"
  | "fixed-term"
  | "seasonal"
  | "internship"
  | "daily";

export type WorkMode =
  | "onsite"
  | "shift"
  | "remote"
  | "hybrid"
  | "home"
  | "mobile";

export type ExperienceLevel = "none" | "under-1" | "1-3" | "3-5" | "5-plus";

export type EducationLevel =
  | "any"
  | "secondary-special"
  | "bachelor"
  | "master"
  | "phd";

export type LanguageCode =
  | "uz"
  | "ru"
  | "en"
  | "tr"
  | "ko"
  | "zh"
  | "de"
  | "ja"
  | "hi"
  | "es"
  | "fr"
  | "pt";

export type ForWhom = "disability" | "graduates" | "students";

export type SocialCategory =
  | "disability"
  | "domestic-violence-survivors"
  | "social-register"
  | "orphans"
  | "released-from-prison"
  | "trafficking-survivors";

export type Benefit =
  | "meals"
  | "transport"
  | "uniform"
  | "housing"
  | "medical"
  | "bonus"
  | "other";

export type Gender = "any" | "male" | "female";

export type Schedule =
  | "6/1"
  | "5/2"
  | "4/4"
  | "4/3"
  | "4/2"
  | "3/3"
  | "3/2"
  | "2/2"
  | "2/1"
  | "1/3"
  | "1/2"
  | "flexible";

export type DriverLicense =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "BE"
  | "CE"
  | "DE"
  | "TM"
  | "TB";

export type SectorId =
  | "qishloq-xojaligi"
  | "talim"
  | "sogliqni-saqlash"
  | "qurilish"
  | "sanoat"
  | "transport"
  | "savdo"
  | "xizmatlar"
  | "moliya"
  | "axborot-texnologiyalari";

export interface Sector {
  id: SectorId;
  slug: SectorId;
  name: Localized;
  shortName: Localized;
  description: Localized;
  /** Phosphor icon name, resolved in components/sector-icon.tsx */
  icon:
    | "Tractor"
    | "Student"
    | "Stethoscope"
    | "HardHat"
    | "Factory"
    | "Truck"
    | "Storefront"
    | "Wrench"
    | "Calculator"
    | "Laptop";
  /** Oson Ish main-field ids this sector aggregates */
  sourceFieldIds: number[];
  /** Display order — follows the district economy, not the alphabet */
  order: number;
}

export interface Mahalla {
  id: string;
  name: Localized;
  nameCyrl: string;
  sourceId: number;
}

export type OrganizationType =
  | "school"
  | "kindergarten"
  | "llc"
  | "state"
  | "private"
  | "other";

export interface Organization {
  id: string;
  slug: string;
  name: Localized;
  legalName: string;
  legalForm: string | null;
  type: OrganizationType;
  tin: string | null;
  sectorId: SectorId;
  mahallaId: string | null;
  address: string | null;
  description: Localized | null;
  isMajor: boolean;
  sourceId: number;
}

export interface Vacancy {
  id: string;
  slug: string;
  title: Localized;
  organizationId: string;
  sectorId: SectorId;
  mahallaId: string | null;
  address: string | null;
  coords: { lat: number; lng: number } | null;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: "UZS";
  salaryNegotiable: boolean;
  paymentType: PaymentType;
  employmentType: EmploymentType;
  workMode: WorkMode;
  schedule: Schedule | null;
  workingHours: { from: string; to: string } | null;
  experience: ExperienceLevel;
  educationLevel: EducationLevel;
  languages: { code: LanguageCode; level: number | null }[];
  driverLicenses: DriverLicense[];
  forWhom: ForWhom[];
  socialCategories: SocialCategory[];
  ageMin: number | null;
  ageMax: number | null;
  gender: Gender;
  openings: number;
  /** Free text from the employer. null when the employer left it empty. */
  description: Localized | null;
  /** Derived from structured fields — never invented. */
  requirements: Localized[];
  conditions: Localized[];
  benefits: Benefit[];
  probationMonths: number | null;
  contactPerson: string | null;
  phone: string | null;
  telegram: string | null;
  publishedAt: string;
  expiresAt: string | null;
  isFeatured: boolean;
  sourceUrl: string;
  sourceId: number;
}

/** Filter state — every key maps 1:1 to a URL query param. */
export interface VacancyFilter {
  q?: string;
  mahalla?: string[];
  sector?: SectorId[];
  position?: string;
  salaryMin?: number;
  salaryMax?: number;
  employment?: EmploymentType[];
  mode?: WorkMode[];
  experience?: ExperienceLevel[];
  education?: EducationLevel[];
  language?: LanguageCode[];
  schedule?: Schedule[];
  social?: SocialCategory[];
  forWhom?: ForWhom[];
  age?: number;
  organization?: string;
  featured?: boolean;
  sort?: VacancySort;
  page?: number;
}

export type VacancySort = "newest" | "oldest" | "salary-asc" | "salary-desc";

export interface VacancyStats {
  openVacancies: number;
  openings: number;
  employers: number;
  averageSalary: number;
  medianSalary: number;
  mahallasCovered: number;
  mahallasTotal: number;
  bySector: Record<SectorId, number>;
  newThisWeek: number;
}
