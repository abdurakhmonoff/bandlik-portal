# Design tokens

Defined once in `app/globals.css` under `@theme` (Tailwind v4). Components use semantic names only; raw hex appears nowhere in `components/` except `components/rare/brand.ts` (canvas and WebGL need literal values).

## Primitive ramps (50 → 950)

| Ramp | 50 | 200 | 400 | 600 | 800 | 950 |
|---|---|---|---|---|---|---|
| qizil | #fbf1ef | #eebab3 | #cc6459 | **#a02d22** | #5e140f | #2b0706 |
| tepa | #f4f5f7 | #d5d9e0 | #8a93a2 | #4e5866 | #2a3340 | #111821 (900 = **#1b2430**) |
| qum | #fbf9f5 | **#f2ebe1** | #cbb897 | #937a4f | #574831 | #251f17 |
| dala | #edf8f5 | #a9dfd0 | #3aa88d | **#0e7c66** | #0a4d40 | #04241f |
| oltin | #fdf8ec | #f3d894 | #dba63a | #a67320 (500 = **#c9922a**) | #63421a | #2c1c0b |

Full ramps are in the CSS.

## Semantic colours (AlignUI naming)

| Token | Value | Tailwind use |
|---|---|---|
| white-0 | #ffffff | `bg-white-0`, `text-white-0` |
| weak-50 | #f4f5f7 | `bg-weak-50` hover rows, inputs |
| soft-200 | #e3e6eb | `bg-soft-200`, `border-soft-200` (stroke-soft-200) |
| sub-300 | #c9cfd8 | `border-sub-300` (stroke-sub-300), handles |
| soft-400 | #67707f | `text-soft-400` placeholders, quiet counts |
| sub-600 | #4e5866 | `text-sub-600` secondary text |
| surface-800 | #2a3340 | `bg-surface-800` neutral hover on ink |
| strong-950 | #1b2430 | `text-strong-950`, `bg-strong-950` |
| disabled-300 | #c9cfd8 | disabled text |
| sand-base / sand-light / sand-stroke | #f2ebe1 / #f7f3ec / #e2d6c3 | section bands, quiet panels, hairlines on sand |
| primary-base / dark / darker | #a02d22 / #7e1f17 / #5e140f | actions |
| primary-alpha-10 / 16 / 24 | color-mix of primary | lighter buttons, focus ring |
| success-base / light / lighter | #0e7c66 / #d3efe7 / #edf8f5 | dala |
| warning-base / dark / light / lighter | #c9922a / #82571b / #faeccc / #fdf8ec | oltin; `warning-dark` for text |
| error-base / light / lighter | #b42318 / #f6dcd8 / #fbf1ef | |
| away-* | = warning | |
| information-* | #3a4350 / #e9ebef / #f4f5f7 | neutral badges |
| feature-* | = primary | |
| static-black / static-white | #111821 / #ffffff | |

## Typography

Families: `font-display` → Bricolage Grotesque (Onest on `html[lang=ru]`), `font-sans` → Onest.

| Style | Size / line | Utility |
|---|---|---|
| title-h1 | 56 / 1.05, −0.02em | `text-title-h1` |
| title-h2 | 44 / 1.08 | `text-title-h2` |
| title-h3 | 36 / 1.12 | `text-title-h3` |
| title-h4 | 28 / 1.2 | `text-title-h4` |
| title-h5 | 22 / 1.25 | `text-title-h5` |
| title-h6 | 18 / 1.35 | `text-title-h6` |
| label-xl … label-xs | 24/32, 18/24, 16/24, 14/20, 12/16 | `text-label-*` |
| paragraph-xl … paragraph-xs | 24/32, 18/28, 16/24, 14/20, 12/16 | `text-paragraph-*` |
| subheading-md … 2xs | 16/24, 14/20, 12/16, 11/12 | `text-subheading-*` |

Extras: `tabular` (tabular lining figures), `display-condensed` / `display-wide` (Bricolage width axis), `prose-width` (42 rem).

## Radii

`rounded-4 6 8 10 12 16 20` = 4, 6, 8, 10, 12, 16, 20 px. Hierarchy: controls 8 (small controls 6), cards 12, panels 16, sheets and the assistant 20, chips full.

## Shadows

| Token | Use |
|---|---|
| shadow-regular-xs | inset-like lift on segmented tabs |
| shadow-regular-sm | hover on tiles, small pills |
| shadow-regular-md | search box, dialogs, assistant panel, menus |
| shadow-button-primary-focus | 1 px primary + 4 px primary at 16 % — the focus ring (`focus-ring` utility) |
| shadow-button-important-focus | neutral focus |
| shadow-button-error-focus | error focus |

## Component sizes

`xxsmall / xsmall / small / medium` = 28 / 32 / 36 / 40 px for Button and IconButton; Input and Select 32 / 36 / 40; Badge small 20 / medium 24; Avatar xsmall 24 / small 32 / medium 40 / large 56; Tooltip xsmall / small.

## Motion

| Token | Value |
|---|---|
| duration-fast / base / slow | 150 / 200 / 250 ms |
| duration-moment / moment-long | 450 / 600 ms |
| ease-out-quart / ease-out-expo | cubic-bezier(0.25,1,0.5,1) / (0.16,1,0.3,1) |
| spring.quick | stiffness 520, damping 38, mass 0.8 |
| spring.panel | stiffness 420, damping 32 |
| spring.bubble | stiffness 420, damping 32 |
| spring.hero | stiffness 260, damping 30 |

Springs live in `lib/motion.ts`. Every animation checks `prefers-reduced-motion`.

## Layout

`site-container` = max 80 rem, 16 / 24 / 32 px gutters. `--header-h` = 4 rem. `hill-mask` masks any block into the hill silhouette; `skeleton` is the shimmer.
