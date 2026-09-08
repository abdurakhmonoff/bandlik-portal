import type { Locale } from "@/types";

/** Welcome chips — client-safe (no data import). Must match the engine vocabulary. */
export function welcomeChips(locale: Locale): string[] {
  return locale === "ru"
    ? ["Вакансии водителя", "Зарплата выше 5 млн", "Работа без опыта", "Как откликнуться?"]
    : ["Haydovchi ishlari", "Maoshi 5 mln dan yuqori", "Tajribasiz uchun ishlar", "Qanday ariza beraman?"];
}
