/**
 * The institution behind the portal.
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  SAMPLE DATA — replace before launch.                          │
 * │  Every value marked `sample` below is a placeholder. Swap the   │
 * │  real address, phones, hours, Telegram and e-mail here and      │
 * │  nothing else in the codebase needs to change.                  │
 * └─────────────────────────────────────────────────────────────────┘
 */

import type { Localized } from "@/types";

export interface ContactPoint {
  label: Localized;
  phone: string;
  /** true while the value is a placeholder */
  sample: boolean;
}

export interface Institution {
  name: Localized;
  shortName: Localized;
  address: Localized;
  addressSample: boolean;
  phones: ContactPoint[];
  email: string;
  emailSample: boolean;
  telegram: { handle: string; url: string; sample: boolean };
  website: { label: string; url: string; sample: boolean };
  /** Working hours, in local wording */
  hours: { days: Localized; time: string; sample: boolean }[];
  /** Map link + coordinates for the office. Coordinates are the district centre. */
  map: { lat: number; lng: number; url: string; sample: boolean };
}

export const hokimlik: Institution = {
  name: {
    uz: "Qiziltepa tumani hokimligi",
    ru: "Хокимият Кызылтепинского района",
  },
  shortName: { uz: "Tuman hokimligi", ru: "Хокимият района" },
  address: {
    uz: "Qiziltepa shahri, Oʻzbekiston koʻchasi, 1-uy", // sample
    ru: "г. Кызылтепа, ул. Узбекистон, дом 1", // sample
  },
  addressSample: true,
  phones: [
    {
      label: { uz: "Qabulxona", ru: "Приёмная" },
      phone: "+998 79 000 00 00", // sample
      sample: true,
    },
  ],
  email: "info@qiziltepa.uz", // sample
  emailSample: true,
  telegram: { handle: "@qiziltepa_hokimligi", url: "https://t.me/qiziltepa_hokimligi", sample: true },
  website: { label: "navoiy.uz", url: "https://navoiy.uz", sample: false },
  hours: [
    { days: { uz: "Dushanba – Juma", ru: "Понедельник – Пятница" }, time: "09:00 – 18:00", sample: true },
    { days: { uz: "Tushlik", ru: "Обед" }, time: "13:00 – 14:00", sample: true },
  ],
  map: {
    lat: 40.0339,
    lng: 64.8475,
    url: "https://yandex.uz/maps/?text=Qiziltepa%20tumani%20hokimligi",
    sample: true,
  },
};

export const bandlikMarkazi: Institution = {
  name: {
    uz: "Qiziltepa tumani Bandlikka koʻmaklashish markazi",
    ru: "Центр содействия занятости Кызылтепинского района",
  },
  shortName: { uz: "Bandlik markazi", ru: "Центр занятости" },
  address: {
    uz: "Qiziltepa shahri, Mirzo Ulugʻbek koʻchasi, 29", // sample
    ru: "г. Кызылтепа, ул. Мирзо Улугбека, 29", // sample
  },
  addressSample: true,
  phones: [
    {
      label: { uz: "Ish qidiruvchilar uchun", ru: "Для соискателей" },
      phone: "+998 79 000 00 01", // sample
      sample: true,
    },
    {
      label: { uz: "Ish beruvchilar uchun", ru: "Для работодателей" },
      phone: "+998 79 000 00 02", // sample
      sample: true,
    },
  ],
  email: "bandlik@qiziltepa.uz", // sample
  emailSample: true,
  telegram: { handle: "@qiziltepa_bandlik", url: "https://t.me/qiziltepa_bandlik", sample: true },
  website: { label: "mehnat.uz", url: "https://mehnat.uz", sample: false },
  hours: [
    { days: { uz: "Dushanba – Juma", ru: "Понедельник – Пятница" }, time: "09:00 – 18:00", sample: true },
    { days: { uz: "Shanba", ru: "Суббота" }, time: "09:00 – 13:00", sample: true },
  ],
  map: {
    lat: 40.0339,
    lng: 64.8475,
    url: "https://yandex.uz/maps/?text=Qiziltepa%20bandlikka%20ko%CA%BBmaklashish%20markazi",
    sample: true,
  },
};

/** National call centre of the Ministry of Employment — real, public numbers. */
export const nationalHelpline = {
  label: { uz: "Bandlik vazirligi ishonch telefoni", ru: "Горячая линия Министерства занятости" },
  phone: "+998 71 200 01 40",
  telegram: { handle: "@mehnat_uz", url: "https://t.me/mehnat_uz" },
};

/** Public Telegram channel for new vacancies — sample handle. */
export const portalTelegram = {
  handle: "@qiziltepa_ish", // sample
  url: "https://t.me/qiziltepa_ish", // sample
  sample: true,
};

export const dataSource = {
  label: "Oson Ish (osonish.uz)",
  url: "https://osonish.uz/vacancies?region=1712&city=1712216",
};
