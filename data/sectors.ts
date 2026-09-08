import type { Sector } from "@/types";

/**
 * Sectors follow the Oson Ish main-field taxonomy, ordered by the
 * district economy (agriculture and irrigation first, then education,
 * health, construction, Navoiy industry) rather than alphabetically.
 */
export const sectors: Sector[] = [
  {
    id: "qishloq-xojaligi",
    slug: "qishloq-xojaligi",
    name: { uz: "Qishloq xoʻjaligi", ru: "Сельское хозяйство" },
    shortName: { uz: "Qishloq xoʻjaligi", ru: "Сельское хозяйство" },
    description: {
      uz: "Paxta, gʻalla, bogʻdorchilik va chorvachilik — Qiziltepaning asosiy tirikchilik manbai. Fermer xoʻjaliklari, agroklasterlar va sugʻorish tashkilotlaridagi ish oʻrinlari.",
      ru: "Хлопок, зерно, садоводство и животноводство — основа экономики Кызылтепы. Вакансии фермерских хозяйств, агрокластеров и ирригационных организаций.",
    },
    icon: "Tractor",
    sourceFieldIds: [7],
    order: 1,
  },
  {
    id: "talim",
    slug: "talim",
    name: { uz: "Taʼlim, madaniyat va sport", ru: "Образование, культура и спорт" },
    shortName: { uz: "Taʼlim", ru: "Образование" },
    description: {
      uz: "Tumandagi 40 dan ortiq maktab, maktabgacha taʼlim tashkilotlari, sport va madaniyat markazlaridagi oʻqituvchi, tarbiyachi va mutaxassis oʻrinlari.",
      ru: "Вакансии учителей, воспитателей и специалистов в более чем 40 школах района, детских садах, спортивных и культурных центрах.",
    },
    icon: "Student",
    sourceFieldIds: [42],
    order: 2,
  },
  {
    id: "sogliqni-saqlash",
    slug: "sogliqni-saqlash",
    name: { uz: "Sogʻliqni saqlash", ru: "Здравоохранение" },
    shortName: { uz: "Tibbiyot", ru: "Медицина" },
    description: {
      uz: "Tuman tibbiyot birlashmasi, oilaviy poliklinikalar va sanitariya xizmatidagi shifokor, hamshira va texnik xodim oʻrinlari.",
      ru: "Врачи, медсёстры и технический персонал районного медицинского объединения, семейных поликлиник и санитарной службы.",
    },
    icon: "Stethoscope",
    sourceFieldIds: [47],
    order: 3,
  },
  {
    id: "qurilish",
    slug: "qurilish",
    name: { uz: "Qurilish", ru: "Строительство" },
    shortName: { uz: "Qurilish", ru: "Строительство" },
    description: {
      uz: "Uy-joy, yoʻl va infratuzilma qurilishi. Usta, gʻisht teruvchi, payvandchi, muhandis va ishchi oʻrinlari.",
      ru: "Жилищное, дорожное и инфраструктурное строительство. Мастера, каменщики, сварщики, инженеры и рабочие.",
    },
    icon: "HardHat",
    sourceFieldIds: [41],
    order: 4,
  },
  {
    id: "sanoat",
    slug: "sanoat",
    name: { uz: "Sanoat va ishlab chiqarish", ru: "Промышленность и производство" },
    shortName: { uz: "Sanoat", ru: "Промышленность" },
    description: {
      uz: "Navoiy sanoat zonasi va tumandagi ishlab chiqarish korxonalari: operator, texnolog, mexanik va ishchi oʻrinlari.",
      ru: "Производственные предприятия района и Навоийской промышленной зоны: операторы, технологи, механики и рабочие.",
    },
    icon: "Factory",
    sourceFieldIds: [21],
    order: 5,
  },
  {
    id: "transport",
    slug: "transport",
    name: { uz: "Transport va logistika", ru: "Транспорт и логистика" },
    shortName: { uz: "Transport", ru: "Транспорт" },
    description: {
      uz: "Haydovchi, ekspeditor, mexanik va ombor xodimi oʻrinlari — tuman va viloyat boʻylab tashish.",
      ru: "Водители, экспедиторы, механики и складские работники — перевозки по району и области.",
    },
    icon: "Truck",
    sourceFieldIds: [36],
    order: 6,
  },
  {
    id: "savdo",
    slug: "savdo",
    name: { uz: "Savdo va marketing", ru: "Торговля и маркетинг" },
    shortName: { uz: "Savdo", ru: "Торговля" },
    description: {
      uz: "Doʻkon, bozor va savdo tarmoqlaridagi sotuvchi, kassir, menejer va merchandayzer oʻrinlari.",
      ru: "Продавцы, кассиры, менеджеры и мерчандайзеры в магазинах, на рынках и в торговых сетях.",
    },
    icon: "Storefront",
    sourceFieldIds: [64],
    order: 7,
  },
  {
    id: "xizmatlar",
    slug: "xizmatlar",
    name: { uz: "Xizmat koʻrsatish", ru: "Сфера услуг" },
    shortName: { uz: "Xizmatlar", ru: "Услуги" },
    description: {
      uz: "Kommunal xizmatlar, taʼmirlash, umumiy ovqatlanish, farrosh va qorovul oʻrinlari.",
      ru: "Коммунальные услуги, ремонт, общественное питание, уборщики и охранники.",
    },
    icon: "Wrench",
    sourceFieldIds: [48],
    order: 8,
  },
  {
    id: "moliya",
    slug: "moliya",
    name: { uz: "Moliya, iqtisod va boshqaruv", ru: "Финансы, экономика и управление" },
    shortName: { uz: "Moliya", ru: "Финансы" },
    description: {
      uz: "Buxgalter, iqtisodchi, kadrlar boʻyicha mutaxassis va ish yurituvchi oʻrinlari — davlat va xususiy tashkilotlarda.",
      ru: "Бухгалтеры, экономисты, специалисты по кадрам и делопроизводители в государственных и частных организациях.",
    },
    icon: "Calculator",
    sourceFieldIds: [1],
    order: 9,
  },
  {
    id: "axborot-texnologiyalari",
    slug: "axborot-texnologiyalari",
    name: { uz: "Axborot texnologiyalari", ru: "Информационные технологии" },
    shortName: { uz: "IT", ru: "IT" },
    description: {
      uz: "Informatika oʻqituvchisi, tizim administratori, dasturchi va texnik yordam oʻrinlari.",
      ru: "Учителя информатики, системные администраторы, программисты и техническая поддержка.",
    },
    icon: "Laptop",
    sourceFieldIds: [12],
    order: 10,
  },
];

export const sectorById = Object.fromEntries(sectors.map((s) => [s.id, s])) as Record<
  Sector["id"],
  Sector
>;
