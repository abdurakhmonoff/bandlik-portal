# Bandlik Portal — Qiziltepa tumani

Public, read-only job portal for Qiziltepa district (Navoiy region). A resident finds a suitable vacancy and gets the employer's phone number within three taps. Two languages: Uzbek Latin at `/`, Russian at `/ru`.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # must pass with zero type errors
npm start
```

Optional: set `NEXT_PUBLIC_SITE_URL` (used for canonical URLs, sitemap and JSON-LD). Defaults to `https://bandlik.qiziltepa.uz`.

## Where things live

| Path | What |
|---|---|
| `data/vacancies.ts` | 150 real Qiziltepa vacancies, generated from the Oson Ish export |
| `data/organizations.ts` | 66 employers, generated |
| `data/mahallas.ts` | 48 mahallas of the district, generated |
| `data/sectors.ts` | 10 sectors, hand-written, ordered by the district economy |
| `data/organization.ts` | The hokimlik and the employment centre — **sample contact data, swap before launch** |
| `lib/vacancies.ts` | The only data-access layer (`getAll`, `getBySlug`, `filter`, `search`, `getSimilar`, `getStats`, facets, URL ↔ filter) |
| `lib/i18n/messages.ts` | Every UI string in `uz` and `ru` |
| `lib/assistant/engine.ts` | The AI yordamchi brain (scripted, over the real data) |
| `components/ui/` | AlignUI-style primitives on Radix, in brand tokens |
| `components/rare/` | Rare UI components restyled to brand tokens |
| `app/globals.css` | The whole token system (`@theme`) |
| `docs/brand.md`, `docs/design-tokens.md` | Identity and token reference |
| `public/brand/` | Logo SVGs (mark, horizontal, stacked; light and dark), favicon set |

## Adding or refreshing vacancies

The seed files are generated, not hand-edited:

1. Fetch the district export: `https://osonish.uz/api/v1/vacancies?soato_district=1712216&per_page=20&page=N` (walk all pages) into `osonish-all.json`, and `https://osonish.uz/api/v1/makhallas?city_soato=1712216` into `makhallas.json`.
2. Keep `agent-overrides.json` next to them: cleaned Uzbek titles, Russian titles, display names for employers, address → mahalla mapping, translated descriptions. Add entries for new ids.
3. Run `python3 scripts/build-seed.py <folder-with-those-three-files>`.

To add a single vacancy by hand, append an object matching the `Vacancy` type in `types/index.ts` to `data/vacancies.ts`. Leave unknown fields `null`; never invent a phone number.

## AI yordamchi

`components/ai-assistant/` is the widget; `app/api/yordamchi/route.ts` is the stateless endpoint; `lib/assistant/engine.ts` is the engine. Today it is scripted: it reads the message in Uzbek or Russian, parses professions, salary thresholds, mahallas, employers and sectors, and answers with real vacancy cards from the data layer. It never invents a vacancy, a salary or a phone number.

To plug in a model later, replace the body of `answer()` (or branch on an API key inside the route) and keep the `AssistantReply` shape in `lib/assistant/types.ts`. The key would go in `.env.local`; nothing else has to change.

## Admin panel

`/admin` is a read-only dashboard over the same seed data: KPI tiles, animated charts (publications per day, salary distribution, sectors, mahallas, employers, employment type, experience) and a quality-control table of the latest listings; `/admin/vakansiyalar` shows every listing in a compact grid with search and filters and an edit sheet (the form is complete, saving is not wired to storage yet — edits live only on the page). It has no backend. The gate is a hard-coded login checked in the browser (`lib/admin/auth.ts`: `admin` / `Qiziltepa2026`), kept in `sessionStorage` — it keeps casual visitors out, it is not security. Replace it with real authentication before the panel controls anything. The route is excluded from `robots.txt`.

## What is deliberately not here

No accounts, no server-side storage, no forms that send anything, no analytics, no cookie banner. "Aloqa maʼlumotlarini koʻrish" reveals the employer's phone and Telegram on the page; it does not submit anything. Saved vacancies live in the visitor's `localStorage`; chat history in `sessionStorage`.

## Data source and credits

Vacancy data: Oson Ish (osonish.uz), the Ministry of Employment platform — credited in the footer and linked from every vacancy. Hero photograph: Unsplash (photo `1541888946425-d81bb19240f5`, construction site, Unsplash licence). District photograph on `/tuman` (the district entrance) supplied by the hokimlik.

## Notes on deviations from the brief

- **Brand name** is "Bandlik Portal" (chosen in the interview), so the mark carries the district name in the stacked lockup and the footer.
- **Bricolage Grotesque has no Cyrillic**; on `/ru` headings switch to Onest 800 with tighter tracking. Still two families.
- **Next.js 15 with `next build`, not `output: "export"`.** Locale routing uses rewrites (`/` → `/uz` internally, `/ru/…` as is) and the two API routes are stateless. Everything else is prerendered (476 pages).
- **Primitives sit on Radix** (the `radix-ui` package) for keyboard and focus behaviour; the styling and API are ours.
- **`emojireaction` was skipped** — it cheapens the civic tone.
- **Rare UI install**: the `shadcn add swamimalode07/rare-ui/<name>` form does not resolve; the components were taken from the registry JSON and restyled by hand in `components/rare/`.
- **Vacancy card is a ledger row**, not a card grid, on desktop.
- **Maps** are OpenStreetMap embeds (no vendor SDK); vacancy coordinates are not in the source, so the marker is the district centre.
- **Hero** carries a photograph under an ink gradient (requested after the first review) rather than plain paper.
