# Bandlik Portal — brand

## Territory

Qiziltepa means "red hill". The district sits where the Zarafshon's irrigated fields meet the edge of the Qizilqum, the red sands. That is the whole creative territory: brick red earth, a low horizon, strong sun, ink-blue shadow, sand. Not civic blue, not startup teal.

## Name and lockup

**Bandlik Portal.** `Bandlik` in Bricolage Grotesque bold ink, `Portal` in medium weight brick red. The stacked lockup adds `Qiziltepa tumani` in Onest under the wordmark, because the name no longer carries the district.

Files in `public/brand/`:

| File | Use |
|---|---|
| `mark.svg`, `mark-dark.svg`, `mark-mono.svg` | The mark alone, 32 px grid; dark variant for ink backgrounds |
| `lockup-horizontal.svg`, `-dark.svg` | Header-style lockup |
| `lockup-stacked.svg`, `-dark.svg` | Print, social avatars, signage |
| `favicon.svg`, `favicon-32.png`, `icon-192.png`, `icon-512.png` | Favicon set (also `app/icon.svg`, `app/apple-icon.png`) |

The lockup SVGs reference the web fonts by name; outline the type in a vector tool before print use.

## The mark

A barchan dune profile: a gentle windward slope rising left to right, a steep slip face, and a rising line off the crest that reads as growth. It sits on a baseline. Minimum size 16 px. Keep clear space equal to the height of the baseline bar on all sides. Do not rotate, outline, add gradients or put it on red.

## The structural device

The same arc, scaled to the page, is the site's only curve. It is the hero's bottom edge, every section transition into a sand band, the footer's ground line, the empty-state illustration, the loading shape and the assistant panel's header line. Everything else on the site is rectilinear with hairlines. If a layout wants a second kind of curve, the answer is no.

## Colour

| Token | Hex | Role |
|---|---|---|
| qizil | `#A02D22` | Actions, active states, the wordmark accent, the featured baseline. Under 10 % of any screen. |
| tepa | `#1B2430` | All text, header, footer field, the hero gradient. Never a tinted black. |
| qum | `#F2EBE1` | Sand bands and quiet panels only. Never the page background. |
| paper | `#FFFFFF` | Page background. Bright, printed. |
| dala | `#0E7C66` | "Yangi", "Faol", online, verified. |
| oltin | `#C9922A` | Featured-vacancy marker and the orb's second colour. Never text. |

All text pairs clear WCAG AA 4.5:1: tepa on paper 15.4, tepa on qum 13.3, qizil on paper 7.3, white on qizil 7.3, dala on paper 5.4, sub-600 on qum 6.9, soft-400 on qum 4.6. Red never sits on sand as body text.

## Type

- **Bricolage Grotesque** (variable, `wdth` + `opsz`): headings. Hero and salary figures use the condensed width at large sizes; section titles at normal width.
- **Onest**: UI, body, data. Tabular lining figures on every salary so lists align down the column.
- Russian pages switch headings to Onest 800 (Bricolage has no Cyrillic).
- Body copy no wider than 42 rem. Sentence case everywhere. No tracked-out capitals, no eyebrows.

## Iconography

Phosphor, regular weight, 16 / 20 / 24 px. Duotone only for the large sector tiles and empty states, with the second layer in red at 20 % alpha. Icons carry meaning; they never decorate a heading. Sectors get specific icons: Tractor, Student, Stethoscope, HardHat, Factory, Truck, Storefront, Wrench, Calculator, Laptop.

## Motion

One idea: things rise, like the hill. Entrances come up from the baseline; the assistant rises from the corner; counters count up. 150–250 ms for UI response, 400–600 ms for the two orchestrated moments (home hero, district image reveal). Springs for anything that moves in space, ease-out for opacity. Hover changes border and shadow one step. Everything respects `prefers-reduced-motion`.

## Voice

Uzbek, sentence case, plain verbs, second person plural. Buttons say what happens: "Aloqa maʼlumotlarini koʻrish". Empty states point somewhere. Errors explain and never apologise. Uzbek Latin uses ʻ (U+02BB) in oʻ and gʻ and ʼ (U+02BC) for the glottal stop; never a straight apostrophe. Russian follows the same register: short, direct, no bureaucratic noun stacks.
