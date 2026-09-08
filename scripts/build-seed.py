#!/usr/bin/env python3
"""
Builds the typed seed files from the Oson Ish export.

Inputs (scratch directory, see README "Data"):
  osonish-all.json      raw vacancy records from https://osonish.uz/api/v1/vacancies?soato_district=1712216
  makhallas.json        https://osonish.uz/api/v1/makhallas?city_soato=1712216
  agent-overrides.json  human-reviewed translations, display names and mahalla mapping

Outputs:
  data/vacancies.ts, data/organizations.ts, data/mahallas.ts

Nothing here invents facts: free-text descriptions come from the employer,
requirements/conditions are derived from structured fields, and a missing
value stays null.
"""
import json, re, sys, os, unicodedata
from datetime import datetime, timezone

SRC = sys.argv[1] if len(sys.argv) > 1 else "."
OUT = os.path.join(os.path.dirname(__file__), "..", "data")

items = json.load(open(os.path.join(SRC, "osonish-all.json"), encoding="utf-8"))
makh = json.load(open(os.path.join(SRC, "makhallas.json"), encoding="utf-8"))["data"]
ov = json.load(open(os.path.join(SRC, "agent-overrides.json"), encoding="utf-8"))

# ---------- dictionaries (Oson Ish system-configs, decoded) ----------
PAYMENT = {1: "monthly", 2: "piecework", 3: "hourly", 4: "contract"}
EMPLOYMENT = {1: "permanent", 2: "fixed-term", 3: "seasonal", 4: "internship", 5: "daily"}
WORKMODE = {1: "onsite", 2: "shift", 3: "remote", 4: "hybrid", 5: "home", 6: "mobile"}
EXPERIENCE = {1: "none", 2: "under-1", 3: "1-3", 4: "3-5", 5: "5-plus"}
EDUCATION = {None: "any", 1: "any", 2: "secondary-special", 3: "bachelor", 4: "master", 5: "phd"}
SCHEDULE = {1: "6/1", 2: "5/2", 3: "4/4", 4: "4/3", 5: "4/2", 6: "3/3", 7: "3/2", 8: "2/2", 9: "2/1", 10: "1/3", 11: "1/2", 12: "flexible"}
LANG = {1: "uz", 2: "ru", 3: "en", 4: "tr", 5: "ko", 6: "zh", 7: "de", 8: "ja", 9: "hi", 10: "es", 11: "fr", 12: "pt"}
FORWHOM = {1: "disability", 2: "graduates", 3: "students"}
SOCIAL = {1: "disability", 2: "domestic-violence-survivors", 3: "social-register", 4: "orphans", 5: "released-from-prison", 6: "trafficking-survivors"}
BENEFIT = {1: "meals", 2: "transport", 3: "uniform", 4: "housing", 5: "medical", 6: "bonus", 7: "other"}
GENDER = {1: "male", 2: "female", 3: "any", None: "any"}
PROBATION = {1: 0, 2: 1, 3: 2, 4: 3}
FIELD_TO_SECTOR = {7: "qishloq-xojaligi", 42: "talim", 47: "sogliqni-saqlash", 41: "qurilish", 21: "sanoat",
                   36: "transport", 64: "savdo", 48: "xizmatlar", 1: "moliya", 12: "axborot-texnologiyalari"}

# ---------- label tables for derived requirement / condition lines ----------
L = {
    "edu": {"secondary-special": ("Maʼlumoti: oʻrta maxsus", "Образование: среднее специальное"),
            "bachelor": ("Maʼlumoti: oliy (bakalavr)", "Образование: высшее (бакалавр)"),
            "master": ("Maʼlumoti: oliy (magistr)", "Образование: высшее (магистратура)"),
            "phd": ("Maʼlumoti: PhD / DSc", "Образование: PhD / DSc")},
    "exp": {"none": ("Ish tajribasi talab etilmaydi", "Опыт работы не требуется"),
            "under-1": ("Ish tajribasi: 1 yilgacha", "Опыт работы: до 1 года"),
            "1-3": ("Ish tajribasi: 1–3 yil", "Опыт работы: 1–3 года"),
            "3-5": ("Ish tajribasi: 3–5 yil", "Опыт работы: 3–5 лет"),
            "5-plus": ("Ish tajribasi: 5 yildan ortiq", "Опыт работы: более 5 лет")},
    "lang": {"uz": ("Oʻzbek tili", "Узбекский язык"), "ru": ("Rus tili", "Русский язык"), "en": ("Ingliz tili", "Английский язык"),
             "tr": ("Turk tili", "Турецкий язык"), "ko": ("Koreys tili", "Корейский язык"), "zh": ("Xitoy tili", "Китайский язык"),
             "de": ("Nemis tili", "Немецкий язык"), "ja": ("Yapon tili", "Японский язык"), "hi": ("Hind tili", "Хинди"),
             "es": ("Ispan tili", "Испанский язык"), "fr": ("Fransuz tili", "Французский язык"), "pt": ("Portugal tili", "Португальский язык")},
    "level": {1: "A1", 2: "A2", 3: "B1", 4: "B2", 5: "C1", 6: "C2"},
    "employment": {"permanent": ("Doimiy ish (shtat asosida)", "Постоянная работа (в штате)"),
                   "fixed-term": ("Muddatli shartnoma", "Срочный договор"),
                   "seasonal": ("Mavsumiy ish", "Сезонная работа"),
                   "internship": ("Stajirovka / amaliyot", "Стажировка / практика"),
                   "daily": ("Kunlik ish", "Подённая работа")},
    "mode": {"onsite": ("Ish joyida", "На рабочем месте"), "shift": ("Smenali ish", "Сменная работа"),
             "remote": ("Masofaviy", "Удалённо"), "hybrid": ("Gibrid (ish joyi + masofaviy)", "Гибрид (офис + удалённо)"),
             "home": ("Kasanachilik (uyda)", "Надомная работа"), "mobile": ("Ish joyi oʻzgaruvchan", "Разъездной характер")},
    "payment": {"monthly": ("Oylik maosh", "Ежемесячная оплата"), "piecework": ("Ishbay toʻlov", "Сдельная оплата"),
                "hourly": ("Soatbay toʻlov", "Почасовая оплата"), "contract": ("Shartnoma asosida toʻlov", "Оплата по договору")},
    "gender": {"male": ("Erkaklar uchun", "Для мужчин"), "female": ("Ayollar uchun", "Для женщин")},
}

def slugify(s):
    s = s.replace("ʻ", "").replace("ʼ", "").replace("’", "").replace("‘", "").replace("'", "").replace("`", "")
    s = unicodedata.normalize("NFKD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s or "x"

def title_case_name(s):
    parts = re.split(r"\s+", s.strip())
    return " ".join(p[:1].upper() + p[1:].lower() if p else p for p in parts)

def fmt_time(t):
    return t[:5] if t else None

def clean_uz(s):
    # normalise apostrophes to the Uzbek Latin convention
    s = re.sub(r"([oOgG])[’'`‘]", lambda m: m.group(1) + "ʻ", s)
    s = re.sub(r"([aeiouAEIOU])[’'`‘](?=[a-zA-Z])", lambda m: m.group(1) + "ʼ", s)
    return s

# ---------- mahallas ----------
mahallas = []
mid_by_source = {}
for m in makh:
    latin = re.sub(r"\s+mahallasi$", "", m["name"]).strip()
    cyr = re.sub(r"\s+маҳалласи$", "", m["name_cyrl"]).strip()
    mid = slugify(latin)
    mid_by_source[m["id"]] = mid
    mahallas.append({"id": mid, "name": {"uz": latin, "ru": cyr}, "nameCyrl": m["name_cyrl"], "sourceId": m["id"]})
mahallas.sort(key=lambda x: x["name"]["uz"])

# ---------- organizations ----------
orgs = {}
org_slugs = set()
for v in items:
    c = v["company"]
    cid = str(c["id"])
    if cid in orgs:
        continue
    o = ov["companies"].get(cid, {})
    name_uz = o.get("name") or title_case_name(c["name"].strip('"'))
    name_ru = o.get("nameRu") or name_uz
    slug = slugify(name_uz)
    if slug in org_slugs:
        slug = f"{slug}-{cid}"
    org_slugs.add(slug)
    fil = v.get("filial") or {}
    addr = fil.get("address") or v.get("address")
    orgs[cid] = {
        "id": f"org-{cid}", "slug": slug,
        "name": {"uz": name_uz, "ru": name_ru},
        "legalName": c["name"], "legalForm": o.get("legalForm"),
        "type": o.get("type", "other"), "tin": c.get("tin"),
        "sectorId": None, "mahallaId": None, "address": (clean_uz(addr.strip()) if addr else None),
        "description": None, "isMajor": False, "sourceId": c["id"],
        "_count": 0, "_sectors": {},
    }

# ---------- vacancies ----------
def sector_for(v, org):
    ids = v.get("mmk_group_field_ids") or []
    for i in ids:
        if i in FIELD_TO_SECTOR:
            return FIELD_TO_SECTOR[i]
    t = (v["title"] + " " + ((v.get("mmk_position") or {}).get("position_name") or "")).lower()
    if org["type"] in ("school", "kindergarten") or re.search(r"o.qituvchi|tarbiyachi|muallim|pedagog|logoped|psixolog|kutubxonachi", t):
        return "talim"
    if re.search(r"shifokor|hamshira|vrach|feldsher|tibb|sanitar", t):
        return "sogliqni-saqlash"
    if re.search(r"buxgalter|iqtisodchi|kadr|ish yurituvchi|yurist|kotib", t):
        return "moliya"
    if re.search(r"haydovchi|traktorchi|ekspeditor", t):
        return "transport"
    if re.search(r"qurilish|payvand|g.isht|beton|usta", t):
        return "qurilish"
    if re.search(r"sotuvchi|kassir|savdo", t):
        return "savdo"
    if re.search(r"fermer|agronom|chorva|dehqon|sug.or|kanal|suv", t):
        return "qishloq-xojaligi"
    if re.search(r"operator|texnolog|mexanik|ishchi|slesar|elektrik", t):
        return "sanoat"
    return "xizmatlar"

vacs = []
slugs = set()
now = datetime(2026, 9, 8, tzinfo=timezone.utc)
promoted = [v for v in items if v.get("is_promoted") == 1 and (v.get("min_salary") or v.get("max_salary"))]
promoted.sort(key=lambda v: (-(v.get("max_salary") or v.get("min_salary") or 0), -(v.get("views_count") or 0)))
featured_ids = {v["id"] for v in promoted[:6]}

for v in items:
    cid = str(v["company"]["id"])
    org = orgs[cid]
    vid = str(v["id"])
    title_uz = ov["titlesUz"].get(vid) or clean_uz(v["title"].strip().rstrip("."))
    title_ru = ov["titlesRu"].get(vid) or title_uz
    slug = f"{slugify(title_uz)}-{vid}"
    assert slug not in slugs
    slugs.add(slug)
    sector = sector_for(v, org)
    org["_count"] += 1
    org["_sectors"][sector] = org["_sectors"].get(sector, 0) + 1
    mah_src = ov["addressToMahalla"].get(v.get("address") or "")
    mahalla_id = mid_by_source.get(mah_src) if mah_src else None
    if mahalla_id and org["mahallaId"] is None:
        org["mahallaId"] = mahalla_id
    exp = EXPERIENCE.get(v.get("work_experiance"), "none")
    edu = EDUCATION.get(v.get("min_education"), "any")
    langs = [{"code": LANG.get(l["language"], "uz"), "level": l.get("level")} for l in (v.get("languages") or []) if l.get("language") in LANG]
    dl = [d for d in (v.get("driver_licenses") or []) if isinstance(d, str)]
    gender = GENDER.get(v.get("gender"), "any")
    schedule = SCHEDULE.get(v.get("working_days_id"))
    hours = {"from": fmt_time(v["working_time_from"]), "to": fmt_time(v["working_time_to"])} if v.get("working_time_from") and v.get("working_time_to") else None
    payment = PAYMENT.get(v.get("payment_type"), "monthly")
    employment = EMPLOYMENT.get(v.get("busyness_type"), "permanent")
    mode = WORKMODE.get(v.get("work_type"), "onsite")
    probation = PROBATION.get(v.get("test_period_id"))

    req = []
    if edu != "any":
        req.append(L["edu"][edu])
    req.append(L["exp"][exp])
    for l in langs:
        n = L["lang"][l["code"]]
        lvl = L["level"].get(l["level"]) if l["level"] else None
        req.append((f"{n[0]}ni bilish" + (f" ({lvl})" if lvl else ""), f"Знание: {n[1].lower()}" + (f" ({lvl})" if lvl else "")))
    if dl:
        req.append((f"Haydovchilik guvohnomasi: {', '.join(dl)} toifa", f"Водительские права категории {', '.join(dl)}"))
    if v.get("need_professional_qualification"):
        req.append(("Kasbiy malaka talab qilinadi", "Требуется профессиональная квалификация"))
    if v.get("age_from") or v.get("age_to"):
        a, b = v.get("age_from"), v.get("age_to")
        rng = f"{a}–{b}" if a and b else (f"{a} yoshdan" if a else f"{b} yoshgacha")
        rng_ru = f"{a}–{b}" if a and b else (f"от {a}" if a else f"до {b}")
        req.append((f"Yosh: {rng}", f"Возраст: {rng_ru}"))
    if gender != "any":
        req.append(L["gender"][gender])
    for s in (v.get("skills_details") or []):
        nm = s.get("name") or s.get("name_uz")
        if nm:
            req.append((clean_uz(nm), s.get("name_ru") or clean_uz(nm)))

    cond = [L["employment"][employment], L["mode"][mode], L["payment"][payment]]
    if schedule:
        sch = ("Erkin grafik", "Свободный график") if schedule == "flexible" else (f"Ish grafigi: {schedule}", f"График: {schedule}")
        cond.append(sch)
    if hours:
        cond.append((f"Ish vaqti: {hours['from']} – {hours['to']}", f"Рабочее время: {hours['from']} – {hours['to']}"))
    if probation is not None:
        cond.append(("Sinov muddati yoʻq", "Без испытательного срока") if probation == 0 else (f"Sinov muddati: {probation} oy", f"Испытательный срок: {probation} мес."))
    if (v.get("count") or 1) > 1:
        cond.append((f"Ochiq oʻrinlar soni: {v['count']}", f"Количество мест: {v['count']}"))

    desc_uz = ov["descriptionsUz"].get(vid) or (clean_uz(v["info"].strip()) if v.get("info") else None)
    desc_ru = ov["descriptionsRu"].get(vid) or desc_uz
    hr = v.get("hr") or {}
    phone = hr.get("phone")
    if phone and not re.fullmatch(r"\+998\d{9}", phone):
        phone = None
    tg = v.get("another_network")
    if tg and not re.search(r"t\.me/|^@", tg):
        tg = None
    if tg:
        tg = tg.strip()
        if tg.startswith("@"):
            tg = "https://t.me/" + tg[1:]
    vacs.append({
        "id": f"v-{vid}", "slug": slug,
        "title": {"uz": title_uz, "ru": title_ru},
        "organizationId": org["id"], "sectorId": sector,
        "mahallaId": mahalla_id, "address": (clean_uz(v["address"].strip()) if v.get("address") else None), "coords": None,
        "salaryMin": v.get("min_salary"), "salaryMax": v.get("max_salary"), "currency": "UZS",
        "salaryNegotiable": not (v.get("min_salary") or v.get("max_salary")),
        "paymentType": payment, "employmentType": employment, "workMode": mode,
        "schedule": schedule, "workingHours": hours,
        "experience": exp, "educationLevel": edu,
        "languages": langs, "driverLicenses": dl,
        "forWhom": [FORWHOM[i] for i in (v.get("for_whos") or []) if i in FORWHOM],
        "socialCategories": [SOCIAL[i] for i in (v.get("social_category_ids") or []) if i in SOCIAL],
        "ageMin": v.get("age_from"), "ageMax": v.get("age_to"), "gender": gender,
        "openings": v.get("count") or 1,
        "description": {"uz": desc_uz, "ru": desc_ru} if desc_uz else None,
        "requirements": [{"uz": a, "ru": b} for a, b in req],
        "conditions": [{"uz": a, "ru": b} for a, b in cond],
        "benefits": [BENEFIT[i] for i in (v.get("benefit_ids") or []) if i in BENEFIT],
        "probationMonths": probation,
        "contactPerson": title_case_name(hr["fio"]) if hr.get("fio") else None,
        "phone": phone, "telegram": tg,
        "publishedAt": v["created_at"][:10], "expiresAt": (v.get("to_date") or None),
        "isFeatured": v["id"] in featured_ids,
        "sourceUrl": f"https://osonish.uz/vacancies/{vid}", "sourceId": v["id"],
    })

vacs.sort(key=lambda x: x["publishedAt"], reverse=True)

# organisations: sector = most common vacancy sector, major = 4+ open roles or non-school with 3+
org_list = []
for o in orgs.values():
    sec = max(o["_sectors"].items(), key=lambda kv: kv[1])[0] if o["_sectors"] else "xizmatlar"
    o["sectorId"] = sec
    o["isMajor"] = o["_count"] >= 5 or (o["type"] in ("llc", "private", "state") and o["_count"] >= 3)
    del o["_count"]; del o["_sectors"]
    org_list.append(o)
org_list.sort(key=lambda x: x["name"]["uz"])

def ts(name, typ, data, header):
    body = json.dumps(data, ensure_ascii=False, indent=2)
    return f"{header}\nimport type {{ {typ} }} from \"@/types\";\n\nexport const {name}: {typ}[] = {body};\n"

H = "// GENERATED by scripts/build-seed.py from the Oson Ish export — edit the overrides, not this file.\n// Source: https://osonish.uz/vacancies?region=1712&city=1712216 (soato_district=1712216), fetched 2026-09-08.\n"
os.makedirs(OUT, exist_ok=True)
open(os.path.join(OUT, "vacancies.ts"), "w", encoding="utf-8").write(ts("vacancies", "Vacancy", vacs, H))
open(os.path.join(OUT, "organizations.ts"), "w", encoding="utf-8").write(ts("organizations", "Organization", org_list, H))
open(os.path.join(OUT, "mahallas.ts"), "w", encoding="utf-8").write(ts("mahallas", "Mahalla", mahallas, H))

print("vacancies", len(vacs), "organizations", len(org_list), "mahallas", len(mahallas))
print("with mahalla", sum(1 for v in vacs if v["mahallaId"]), "with phone", sum(1 for v in vacs if v["phone"]),
      "with description", sum(1 for v in vacs if v["description"]), "featured", sum(1 for v in vacs if v["isFeatured"]))
from collections import Counter
print(Counter(v["sectorId"] for v in vacs))
bad = [v["title"]["uz"] for v in vacs if re.search(r"['`]", v["title"]["uz"])]
print("straight apostrophes in titles:", bad[:5])
