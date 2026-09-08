import { Bricolage_Grotesque, Onest } from "next/font/google";

/** Display: Bricolage Grotesque, variable — width and optical-size axes used at large sizes. */
export const bricolage = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  axes: ["wdth", "opsz"],
  display: "swap",
  variable: "--font-bricolage",
});

/** UI / body / data: Onest — Cyrillic for the Russian locale, tabular figures for salaries. */
export const onest = Onest({
  subsets: ["latin", "latin-ext", "cyrillic"],
  display: "swap",
  variable: "--font-onest",
});
