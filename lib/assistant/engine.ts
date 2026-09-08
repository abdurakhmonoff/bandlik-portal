/**
 * The AI yordamchi brain — a scripted engine over the real vacancy data.
 *
 * It answers only about vacancies, employers, sectors, salaries, application
 * steps and district employment services, in the language the user wrote in,
 * and it never invents a vacancy, a salary or a phone number: every card it
 * shows comes from lib/vacancies. A model-backed engine can replace `answer`
 * behind the same signature later (see README).
 */
import type { Locale, Vacancy, VacancyFilter } from "@/types";
import { filter, getAll, getBySlug, getMahalla, getMahallas, getOrganizationById, getOrganizations, getSectors, getSimilar, getStats, search } from "@/lib/vacancies";
import { normalize, tokens } from "@/lib/search";
import { formatCompactSum } from "@/lib/format";
import { localePath } from "@/lib/i18n/config";
import type { AssistantReply, AssistantRequest, AssistantVacancyCard } from "@/lib/assistant/types";

const MAX_CARDS = 4;

/* ------------------------------------------------------------------ */
/* Language detection                                                  */
/* ------------------------------------------------------------------ */

function detectLocale(text: string, fallback: Locale): Locale {
  const cyr = (text.match(/[а-яё]/gi) ?? []).length;
  const lat = (text.match(/[a-z]/gi) ?? []).length;
  if (cyr > lat) {
    // Uzbek Cyrillic has letters Russian does not
    return /[ўқғҳ]/i.test(text) ? "uz" : "ru";
  }
  if (lat > 0) {
    return /\b(the|job|work|salary|driver|teacher|how|hello|hi)\b/i.test(text) && !/[ʻʼ]/.test(text) ? fallback : fallback === "ru" ? "uz" : fallback;
  }
  return fallback;
}

/* ------------------------------------------------------------------ */
/* Copy                                                                */
/* ------------------------------------------------------------------ */

const T = {
  uz: {
    greeting: "Assalomu alaykum! Kasbingizni yozing — masalan, «haydovchi» yoki «oʻqituvchi» — men Qiziltepadagi mos vakansiyalarni topib beraman.",
    found: (n: number, what: string) => `${what} boʻyicha ${n} ta vakansiya topdim. Eng mosi:`,
    foundOne: (what: string) => `${what} boʻyicha bitta vakansiya bor:`,
    none: (what: string) => `«${what}» boʻyicha hozircha vakansiya yoʻq. Boshqacha yozib koʻring yoki sohani tanlang. Yangi eʼlonlar har kuni qoʻshiladi — Telegram kanalga obuna boʻlsangiz, oʻtkazib yubormaysiz.`,
    salaryAbove: (s: string) => `Maoshi ${s} soʻmdan yuqori`,
    salaryBelow: (s: string) => `Maoshi ${s} soʻmgacha`,
    noExp: "Tajriba talab qilinmaydigan ishlar",
    forStudents: "Talaba va bitiruvchilar uchun",
    forDisability: "Nogironligi boʻlgan shaxslar uchun",
    inMahalla: (m: string) => `${m} mahallasi`,
    atOrg: (o: string) => `${o}`,
    sector: (s: string) => `${s} sohasi`,
    similar: "Shu ishga oʻxshash vakansiyalar:",
    noSimilar: "Bu vakansiyaga oʻxshash boshqa eʼlon topilmadi. Sohadagi barcha vakansiyalarni roʻyxatda koʻrishingiz mumkin.",
    howTo:
      "Ariza berish uchun roʻyxatdan oʻtish shart emas:\n1. Vakansiyani oching.\n2. «Aloqa maʼlumotlarini koʻrish» tugmasini bosing.\n3. Ish beruvchiga qoʻngʻiroq qiling yoki Telegramda yozing — «Bandlik Portal orqali koʻrdim» deb ayting.\nKerakli hujjatlar roʻyxati Yordam sahifasida.",
    contact:
      "Telefon raqami har bir vakansiya sahifasida «Aloqa maʼlumotlarini koʻrish» tugmasi ostida. Bu yerda raqamlarni koʻrsatmayman — sahifada aniq va nusxa olish tugmasi bilan.",
    contactCurrent: "Bu vakansiyaning telefon raqami sahifadagi «Aloqa maʼlumotlarini koʻrish» tugmasi ostida — pastroqqa tushing yoki tugmani bosing.",
    stats: (n: number, e: number, avg: string) => `Hozir portalda ${n} ta ochiq vakansiya, ${e} ta ish beruvchi. Koʻrsatilgan maoshlarning oʻrtachasi — ${avg} soʻm.`,
    outOfScope:
      "Men faqat Qiziltepa tumanidagi ish oʻrinlari, ish beruvchilar, maosh va ariza berish tartibi haqida javob beraman. Boshqa savollar boʻyicha Bandlik markaziga murojaat qiling.",
    unsure: "Bu savolga aniq javob bera olmayman. Bandlikka koʻmaklashish markazi yordam beradi — aloqa sahifasida telefon va manzil bor.",
    seeAll: "Roʻyxatda koʻrish",
    help: "Yordam sahifasi",
    contactPage: "Aloqa sahifasi",
    telegram: "Telegram kanal",
    chips: {
      driver: "Haydovchi ishlari",
      teacher: "Oʻqituvchi ishlari",
      salary5: "Maoshi 5 mln dan yuqori",
      noExp: "Tajribasiz uchun ishlar",
      howTo: "Qanday ariza beraman?",
      nearMe: "Mahallam boʻyicha",
      similar: "Oʻxshash vakansiyalar",
      all: "Barcha vakansiyalar",
    },
  },
  ru: {
    greeting: "Здравствуйте! Напишите профессию — например, «водитель» или «учитель» — и я подберу подходящие вакансии в Кызылтепе.",
    found: (n: number, what: string) => `Нашёл ${n} вакансий: ${what}. Самые подходящие:`,
    foundOne: (what: string) => `Есть одна вакансия: ${what}:`,
    none: (what: string) => `По запросу «${what}» вакансий пока нет. Попробуйте иначе или выберите отрасль. Новые объявления добавляются каждый день — подпишитесь на Telegram-канал, чтобы не пропустить.`,
    salaryAbove: (s: string) => `зарплата выше ${s} сум`,
    salaryBelow: (s: string) => `зарплата до ${s} сум`,
    noExp: "работа без опыта",
    forStudents: "для студентов и выпускников",
    forDisability: "для лиц с инвалидностью",
    inMahalla: (m: string) => `махалля ${m}`,
    atOrg: (o: string) => `${o}`,
    sector: (s: string) => `отрасль «${s}»`,
    similar: "Похожие вакансии:",
    noSimilar: "Похожих объявлений не нашлось. Все вакансии отрасли можно посмотреть в списке.",
    howTo:
      "Регистрация не нужна:\n1. Откройте вакансию.\n2. Нажмите «Показать контакты».\n3. Позвоните работодателю или напишите в Telegram — скажите «увидел на Bandlik Portal».\nСписок документов — на странице «Помощь».",
    contact:
      "Телефон есть на странице каждой вакансии под кнопкой «Показать контакты». Здесь я номера не показываю — на странице они точные и с кнопкой копирования.",
    contactCurrent: "Телефон этой вакансии — под кнопкой «Показать контакты» на странице. Прокрутите вниз или нажмите кнопку.",
    stats: (n: number, e: number, avg: string) => `Сейчас на портале ${n} открытых вакансий от ${e} работодателей. Средняя из указанных зарплат — ${avg} сум.`,
    outOfScope:
      "Я отвечаю только о вакансиях, работодателях, зарплатах и порядке отклика в Кызылтепинском районе. По другим вопросам обратитесь в Центр занятости.",
    unsure: "Точно ответить не могу. Поможет Центр содействия занятости — телефон и адрес на странице контактов.",
    seeAll: "Смотреть в списке",
    help: "Страница помощи",
    contactPage: "Страница контактов",
    telegram: "Telegram-канал",
    chips: {
      driver: "Вакансии водителя",
      teacher: "Вакансии учителя",
      salary5: "Зарплата выше 5 млн",
      noExp: "Работа без опыта",
      howTo: "Как откликнуться?",
      nearMe: "По моей махалле",
      similar: "Похожие вакансии",
      all: "Все вакансии",
    },
  },
} as const;

/* ------------------------------------------------------------------ */
/* Vocabulary → intent                                                 */
/* ------------------------------------------------------------------ */

const RX = {
  greeting: /^(salom|assalom|assalomu alaykum|hello|hi|привет|здравствуйте|салом|ассалому)\b/i,
  howTo: /(ariza|qanday (ishga|ariza|murojaat|topaman)|hujjat|rezyume|resume|как (откликнуться|подать|устроиться|найти)|заявк|документ|резюме)/i,
  contact: /(telefon|raqam|nomer|kontakt|aloqa|bogʻlan|boglan|телефон|номер|контакт|связаться|позвонить)/i,
  similar: /(oʻxshash|o'xshash|oxshash|shunga oʻxshash|похож|аналогичн|такие же|shunaqa)/i,
  stats: /(nechta|qancha|statistik|сколько|статистик)/i,
  noExp: /(tajribasiz|tajriba(si)? (talab|yoʻq|yoq|kerak emas)|boshlovchi|birinchi ish|без опыта|нет опыта|начинающ|первая работа)/i,
  students: /(talaba|bitiruvchi|student|студент|выпускник)/i,
  disability: /(nogiron|imkoniyati cheklangan|инвалид|ограниченн)/i,
  youth: /(yoshlar|молодёж|молодеж)/i,
  women: /(ayollar|xotin|женщин|для женщин)/i,
  above: /(dan (yuqori|baland|koʻp|kop|ortiq)|yuqori|выше|больше|от|более|минимум)/i,
  below: /(gacha|kam|past|до|меньше|ниже|максимум)/i,
  outOfScope: /(ob-havo|погода|kurs|dollar|доллар|футбол|futbol|prezident|президент|siyosat|политик|recept|рецепт|kredit|кредит)/i,
};

/** Profession synonyms → search terms (users write ru or uz). */
const SYNONYMS: [RegExp, string][] = [
  [/(водител|шофёр|шофер|haydovchi|shofyor|shofer)/i, "haydovchi"],
  [/(учител|преподават|педагог|oʻqituvchi|o'qituvchi|oqituvchi|muallim)/i, "oʻqituvchi"],
  [/(воспитател|tarbiyachi)/i, "tarbiyachi"],
  [/(бухгалтер|buxgalter|hisobchi)/i, "buxgalter"],
  [/(медсестр|hamshira)/i, "hamshira"],
  [/(врач|доктор|shifokor|vrach)/i, "shifokor"],
  [/(охран|qorovul|soqchi)/i, "qorovul"],
  [/(уборщи|farrosh|tozalovchi)/i, "farrosh"],
  [/(повар|oshpaz)/i, "oshpaz"],
  [/(продав|sotuvchi|kassir|кассир)/i, "sotuvchi"],
  [/(сварщ|payvandchi)/i, "payvandchi"],
  [/(строител|quruvchi|qurilish|стройк)/i, "qurilish"],
  [/(электрик|elektrik)/i, "elektrik"],
  [/(инженер|muhandis)/i, "muhandis"],
  [/(психолог|psixolog)/i, "psixolog"],
  [/(логопед|logoped)/i, "logoped"],
  [/(библиотек|kutubxonachi)/i, "kutubxonachi"],
  [/(оператор|operator)/i, "operator"],
  [/(механик|mexanik)/i, "mexanik"],
  [/(тракторист|traktorchi)/i, "traktorchi"],
  [/(агроном|agronom)/i, "agronom"],
  [/(лаборант|laborant)/i, "laborant"],
  [/(секретар|kotib|ish yurituvchi|делопроизвод)/i, "ish yurituvchi"],
  [/(музык|musiqa)/i, "musiqa"],
  [/(физкульт|jismoniy)/i, "jismoniy tarbiya"],
  [/(математик|matematika)/i, "matematika"],
  [/(информатик|informatika)/i, "informatika"],
  [/(англий|ingliz)/i, "ingliz tili"],
  [/(русск(ий|ого) язык|rus tili)/i, "rus tili"],
  [/(началь|boshlangʻich|boshlang'ich|boshlangich)/i, "boshlangʻich"],
  [/(химик|kimyo)/i, "kimyo"],
  [/(биолог|biologiya)/i, "biologiya"],
  [/(истори|tarix)/i, "tarix"],
  [/(географ|geografiya)/i, "geografiya"],
  [/(физик|fizika)/i, "fizika"],
  [/(рабоч|ishchi|разнорабоч)/i, "ishchi"],
];

function parseSalary(text: string): { min?: number; max?: number } {
  const t = text.toLowerCase().replace(/\s+/g, " ");
  const m = t.match(/(\d+(?:[.,]\d+)?)\s*(mln|million|млн|миллион)/) ?? t.match(/(\d{1,3}(?: \d{3}){1,2}|\d{6,8})/);
  if (!m) return {};
  const raw = m[1].replace(",", ".").replace(/ /g, "");
  let n = Number(raw);
  if (!Number.isFinite(n)) return {};
  if (m[2]) n = n * 1_000_000;
  if (n < 100_000) n = n * 1_000_000; // "5" alone with "mln" already handled; a bare "5" is ambiguous → treat as mln
  return RX.below.test(t) && !RX.above.test(t) ? { max: n } : { min: n };
}

function matchMahalla(text: string) {
  const n = normalize(text);
  return getMahallas().find((m) => {
    const a = normalize(m.name.uz);
    const b = normalize(m.name.ru);
    return a.length > 3 && (n.includes(a) || n.includes(b));
  });
}

function matchSector(text: string, locale: Locale) {
  const n = normalize(text);
  return getSectors().find((s) => {
    const names = [s.shortName.uz, s.shortName.ru, s.name.uz, s.name.ru].map(normalize);
    return names.some((x) => x.length > 3 && n.includes(x));
  }) ?? (locale && undefined);
}

function matchOrganization(text: string) {
  const n = normalize(text);
  const hits = getOrganizations().filter((o) => {
    const key = normalize(o.name.uz).replace(/\b(qiziltepa|tumani|tuman)\b/g, "").trim();
    return key.length > 4 && n.includes(key);
  });
  return hits[0];
}

/* ------------------------------------------------------------------ */
/* Cards                                                               */
/* ------------------------------------------------------------------ */

function card(v: Vacancy, locale: Locale): AssistantVacancyCard {
  const org = getOrganizationById(v.organizationId);
  const mahalla = v.mahallaId ? getMahalla(v.mahallaId) : undefined;
  return {
    id: v.id,
    slug: v.slug,
    title: v.title[locale],
    organization: org?.name[locale] ?? null,
    mahalla: mahalla?.name[locale] ?? null,
    salaryMin: v.salaryMin,
    salaryMax: v.salaryMax,
    salaryNegotiable: v.salaryNegotiable,
    paymentType: v.paymentType,
  };
}

function listLink(locale: Locale, f: VacancyFilter, label: string) {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.sector?.length) p.set("soha", f.sector.join(","));
  if (f.mahalla?.length) p.set("mahalla", f.mahalla.join(","));
  if (f.salaryMin) p.set("maoshdan", String(f.salaryMin));
  if (f.salaryMax) p.set("maoshgacha", String(f.salaryMax));
  if (f.experience?.length) p.set("tajriba", f.experience.join(","));
  if (f.forWhom?.length) p.set("kimlar", f.forWhom.join(","));
  if (f.social?.length) p.set("toifa", f.social.join(","));
  if (f.organization) p.set("tashkilot", f.organization);
  const qs = p.toString();
  return { href: localePath(locale, `/vakansiyalar${qs ? `?${qs}` : ""}`), label };
}

/* ------------------------------------------------------------------ */
/* Main entry                                                          */
/* ------------------------------------------------------------------ */

export function answer(req: AssistantRequest): AssistantReply {
  const message = req.message.trim().slice(0, 300);
  const locale = detectLocale(message, req.locale);
  const t = T[locale];
  const current = req.currentVacancy ? getBySlug(req.currentVacancy) : undefined;
  const chips = t.chips;

  if (!message) {
    return { text: t.greeting, suggestions: [chips.driver, chips.salary5, chips.noExp, chips.howTo], intent: "empty" };
  }
  if (RX.greeting.test(message) && tokens(message).length <= 3) {
    return { text: t.greeting, suggestions: [chips.driver, chips.teacher, chips.salary5, chips.howTo], intent: "greeting" };
  }
  if (RX.outOfScope.test(message)) {
    return { text: t.outOfScope, link: { href: localePath(locale, "/aloqa"), label: t.contactPage }, suggestions: [chips.all, chips.howTo], intent: "out-of-scope" };
  }
  if (RX.howTo.test(message)) {
    return { text: t.howTo, link: { href: localePath(locale, "/yordam"), label: t.help }, suggestions: [chips.driver, chips.noExp, chips.all], intent: "how-to" };
  }
  if (RX.similar.test(message) && current) {
    const sim = getSimilar(current, MAX_CARDS);
    if (sim.length === 0) {
      return { text: t.noSimilar, link: listLink(locale, { sector: [current.sectorId] }, t.seeAll), intent: "similar-empty" };
    }
    return { text: t.similar, vacancies: sim.map((v) => card(v, locale)), link: listLink(locale, { sector: [current.sectorId] }, t.seeAll), intent: "similar" };
  }
  if (RX.contact.test(message) && !/(ish|работ|vakans|вакан)/i.test(message.replace(/aloqa maʼlumot/i, ""))) {
    return {
      text: current ? t.contactCurrent : t.contact,
      link: current ? { href: localePath(locale, `/vakansiyalar/${current.slug}#aloqa`), label: locale === "ru" ? "Показать контакты" : "Aloqa maʼlumotlarini koʻrish" } : { href: localePath(locale, "/aloqa"), label: t.contactPage },
      intent: "contact",
    };
  }
  if (RX.stats.test(message) && !RX.noExp.test(message)) {
    const s = getStats();
    return { text: t.stats(s.openVacancies, s.employers, formatCompactSum(s.averageSalary, locale)), link: listLink(locale, {}, t.seeAll), suggestions: [chips.driver, chips.teacher, chips.salary5], intent: "stats" };
  }

  /* ---- build a filter from everything we can read in the message ---- */
  const f: VacancyFilter = {};
  const parts: string[] = [];
  const salary = parseSalary(message);
  if (salary.min) {
    f.salaryMin = salary.min;
    parts.push(t.salaryAbove(formatCompactSum(salary.min, locale)));
  }
  if (salary.max) {
    f.salaryMax = salary.max;
    parts.push(t.salaryBelow(formatCompactSum(salary.max, locale)));
  }
  if (RX.noExp.test(message)) {
    f.experience = ["none"];
    parts.push(t.noExp);
  }
  if (RX.students.test(message)) {
    f.experience = ["none"];
    parts.push(t.forStudents);
  }
  if (RX.disability.test(message)) {
    f.social = ["disability"];
    parts.push(t.forDisability);
  }
  const mahalla = matchMahalla(message);
  if (mahalla) {
    f.mahalla = [mahalla.id];
    parts.push(t.inMahalla(mahalla.name[locale]));
  }
  const org = matchOrganization(message);
  if (org) {
    f.organization = org.id;
    parts.push(t.atOrg(org.name[locale]));
  }
  const sector = matchSector(message, locale);
  if (sector && !org) {
    f.sector = [sector.id];
    parts.push(t.sector(sector.shortName[locale]));
  }
  let query: string | undefined;
  for (const [rx, term] of SYNONYMS) {
    if (rx.test(message)) {
      query = term;
      break;
    }
  }
  if (!query && !sector && !org) {
    // free text: strip filler words and keep what looks like a profession
    const filler = /\b(ish|ishlar|ishi|vakansiya|vakansiyalar|kerak|topib|bering|ber|menga|uchun|boʻyicha|boyicha|работа|работу|вакансии|вакансия|нужна|нужно|найди|найти|мне|для|по|хочу|ищу|в|на|и|va|yoki|или|qidiryapman|qidiraman|bormi|есть|ли)\b/gi;
    const cleaned = message.replace(filler, " ").replace(/\s+/g, " ").trim();
    if (cleaned.length > 1 && !/^\d+([.,]\d+)?\s*(mln|млн)?$/i.test(cleaned)) query = cleaned;
  }
  if (query) {
    f.q = query;
    parts.unshift(locale === "ru" ? `«${query}»` : `«${query}»`);
  }

  const what = parts.join(", ");
  const hasIntent = Object.keys(f).length > 0;
  if (!hasIntent) {
    return { text: t.unsure, link: { href: localePath(locale, "/aloqa"), label: t.contactPage }, suggestions: [chips.driver, chips.teacher, chips.noExp, chips.howTo], intent: "unsure" };
  }

  let results = filter({ ...f, sort: "salary-desc" }).items;
  // If a free-text query returns nothing but a filter alone would, relax the query.
  if (results.length === 0 && f.q && (f.sector || f.mahalla || f.salaryMin)) {
    results = filter({ ...f, q: undefined, sort: "salary-desc" }).items;
  }
  if (results.length === 0 && f.q) {
    results = search(f.q, MAX_CARDS);
  }
  if (results.length === 0) {
    return {
      text: t.none(what || message),
      link: { href: localePath(locale, "/vakansiyalar"), label: t.seeAll },
      suggestions: [chips.teacher, chips.noExp, chips.all],
      intent: "search-empty",
    };
  }
  const total = filter(f).total || results.length;
  const cards = results.slice(0, MAX_CARDS).map((v) => card(v, locale));
  const text = total === 1 ? t.foundOne(what) : t.found(total, what);
  const suggestions = [
    ...(f.salaryMin ? [] : [chips.salary5]),
    ...(f.experience ? [] : [chips.noExp]),
    ...(current ? [chips.similar] : []),
    chips.howTo,
  ].slice(0, 3);
  return { text, vacancies: cards, link: total > cards.length ? listLink(locale, f, `${t.seeAll} (${total})`) : undefined, suggestions, intent: "search" };
}

/** Exposed for the welcome card so the chips match the engine vocabulary. */
export function welcomeChips(locale: Locale): string[] {
  const c = T[locale].chips;
  return [c.driver, c.salary5, c.noExp, c.howTo];
}

/** Quick sanity export used by tests/scripts. */
export function vacancyCount(): number {
  return getAll().length;
}
