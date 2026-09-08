# components/rare

Seven components taken from the [Rare UI](https://rareui.com) registry and
restyled to Bandlik Portal tokens. Motion and public APIs are unchanged except
where noted under **Changed behaviour**.

House rules for this folder:

- every file starts with `// Adapted from Rare UI (rareui.com) — restyled to Bandlik Portal tokens.`
- every file is `"use client"`
- colours come from token classes (`bg-sand-base`, `text-strong-950`, …); a
  colour that has to reach JavaScript (WebGL uniform, canvas fill, SVG stop)
  is imported from `./brand`, never written as a literal
- no `dark:` variants — the portal is light only
- `prefers-reduced-motion` is respected in all seven

---

## `brand.ts`

The only place a raw hex may live. Mirrors the `@theme` block in `app/globals.css`.

| Export | Value | Token |
| --- | --- | --- |
| `BRAND_PRIMARY` | `#A02D22` | `--color-primary-base` |
| `BRAND_INK` | `#1B2430` | `--color-strong-950` |
| `BRAND_SAND` | `#F2EBE1` | `--color-sand-base` |
| `BRAND_SAND_STROKE` | `#E2D6C3` | `--color-sand-stroke` |
| `BRAND_FIELD` | `#0E7C66` | `--color-success-base` |
| `BRAND_GOLD` | `#C9922A` | `--color-oltin-500` |
| `BRAND_WHITE` | `#FFFFFF` | `--color-static-white` |
| `BRAND_WEAK` | `#F4F5F7` | `--color-weak-50` |
| `BRAND_SOFT` | `#E3E6EB` | `--color-soft-200` |

Also exports `BRAND` (the same values as an object), `hexToRgb255`,
`hexToRgb01` (for GL uniforms), `withAlpha`, and the `Rgb255` / `Rgb01` types.

```tsx
import { BRAND_GOLD, hexToRgb01 } from "@/components/rare/brand";
```

---

## `AnimatedCounter` — `animated-counter.tsx`

Odometer digits on a masked wheel.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `number` | — (required) |
| `decimals` | `number` | `0` |
| `duration` | `number` (seconds) | `0.6` |
| `padStart` | `number` | `1` |
| `separator` | `string` | `","` |
| `decimalSeparator` | `string` | `"."` |
| `grouping` | `"western" \| "indian"` | `"western"` |
| `prefix` | `ReactNode` | — |
| `suffix` | `ReactNode` | — |
| `inView` | `boolean` | `true` |

…plus `ComponentProps<"span">` minus `children`, `prefix` and the drag/animation
handlers. Also exports the `Grouping` and `AnimatedCounterProps` types.

```tsx
<AnimatedCounter value={12480} separator=" " inView={isVisible} className="text-title-h2" />
```

**Changed behaviour**

- Digits render `font-display tabular text-strong-950`.
- `inView` is new: while it is `false` the counter renders `0`. The first time
  it turns `true` the wheel rolls 0 → `value`. Scrolling back out does **not**
  reset it — after the first reveal the counter tracks `value` as before, so a
  live number keeps working. Pass it from an IntersectionObserver.
- Reduced motion still jumps straight to the value, `inView` included.

---

## `FluidOrb` — `fluid-orb.tsx`

WebGL fbm churn inside a circle.

| Prop | Type | Default |
| --- | --- | --- |
| `size` | `number` (px) | `240` |
| `color` | `string` | `BRAND_PRIMARY` (`#A02D22`) |
| `color2` | `string` | `BRAND_GOLD` (`#C9922A`) |
| `paused` | `boolean` | `false` |

…plus `ComponentProps<"div">` (`className` and `style` are merged, not replaced).

```tsx
<FluidOrb size={320} paused={!launcherVisible} className="shadow-regular-md" />
```

**Changed behaviour**

- Second uniform `u_color2`. The fragment shader blends `u_color` → `u_color2`
  by `smoothstep(0.25, 0.75, f)` on the fbm value, so red and gold both travel
  through the churn instead of one flat hue.
- `paused` stops the RAF loop and leaves the settled frame on screen — use it
  when the orb scrolls out of view. Reduced motion takes the same static frame.
- The canvas is `aria-hidden`; reduced motion is now watched live via
  `matchMedia`, not sampled once at mount.

---

## `GooeyNav` — `gooey-nav.tsx`

Segmented nav whose active tile pulls a gooey neck out of its neighbours.

| Prop | Type | Default |
| --- | --- | --- |
| `items` | `(string \| { label, href?, icon? })[]` | — (required) |
| `value` | `number` | — (uncontrolled if omitted) |
| `defaultValue` | `number` | `0` |
| `onChange` | `(index: number) => void` | — |
| `size` | `"xs" \| "sm" \| "md" \| "lg"` | `"md"` |
| `activeColor` | `string` | `BRAND_INK` (`#1B2430`) |
| `activeLabelColor` | `string` | `BRAND_WHITE` (`#FFFFFF`) |
| `separation` | `number` | per `size` |
| `radius` | `number` | per `size` |

…plus `ComponentProps<"nav">` minus `onChange`. Also exports `GooeyNavItem`,
`GooeyNavSize` and `GooeyNavProps`.

```tsx
<GooeyNav items={[{ label: "Bosh sahifa", href: "/" }, { label: "Vakansiyalar", href: "/vakansiyalar" }]} />
```

**Changed behaviour**

- Bar is `bg-sand-base`; inactive labels are `text-sub-600` and go
  `text-strong-950` on hover. The seam SVG paints with `currentColor`, so the
  bar colour also lives on `text-sand-base`.
- An item with `href` renders a `next/link` `<Link>`, so navigation works with
  JS off; the click still drives the gooey animation. Items without `href`
  render a `<button>`.
- The active item always carries `aria-current="page"` (it used to be `true`
  for buttons).
- Labels get `min-h-11` (44px tap target) whatever `size` trims off, and the
  `<nav>` scrolls sideways on narrow screens via `overflow-x-auto no-scrollbar`.
  It is now block-level rather than `inline-block`.

---

## `GridReveal` — `grid-reveal.tsx`

A sand-coloured cell grid that subdivides while an image loads, then dissolves
into the photo.

| Prop | Type | Default |
| --- | --- | --- |
| `src` | `string \| null` | — |
| `alt` | `string` | `""` |
| `progress` | `number` (0–1) | — (self-paced if omitted) |
| `aspect` | `number` | `1` |
| `caption` | `string` | — |
| `estimatedDuration` | `number` (ms) | `6000` |
| `onRevealComplete` | `() => void` | — |
| `onError` | `() => void` | — |

…plus `ComponentProps<"div">` minus `children`.

```tsx
<GridReveal src="/images/qiziltepa-hero.jpg" alt="Qiziltepa markazi" aspect={16 / 9} caption="Yuklanmoqda…" />
```

**Changed behaviour**

- Placeholder cells ramp `#F2EBE1` → `#E2D6C3` with up to 6% `#1B2430` bled
  into the deepest cells; the caption shimmer is a sand-to-white sweep.
- The `dark` branch is gone — no more `documentElement.classList` probe per
  frame, and the scene no longer carries a `dark` flag.
- Frame is `rounded-16 bg-sand-base`; caption pill is `bg-strong-950/45`.
- `src` under `/images/…` from `public/` works: the loader tries
  `crossOrigin="anonymous"` first and silently retries without it, and
  same-origin images keep `getImageData` (the per-cell colour sampling) legal.
  Always pass `alt` — with it the canvas is `role="img"` + `aria-label`, without
  it the canvas goes `aria-hidden`.

---

## `NotificationBell` — `notification-bell.tsx`

Bell that swings, with a rolling-digit badge.

| Prop | Type | Default |
| --- | --- | --- |
| `count` | `number` | `0` |
| `max` | `number` | `99` |
| `variant` | `"count" \| "dot"` | `"count"` |
| `size` | `number` (px) | `48` |
| `color` | `"red" \| "green" \| "gold"` | `"red"` |
| `asChild` | `boolean` | `false` |
| `icon` | `ReactNode` | — (default bell SVG) |
| `children` | `ReactNode` | — (only with `asChild`) |

…plus `ComponentProps<"button">` minus `children`, `color` and the
drag/animation handlers. Also exports `NotificationBellColor`.

```tsx
<NotificationBell count={unread} color="gold" aria-label="Bildirishnomalar" />
```

**Changed behaviour**

- Surface is `bg-white-0 border border-soft-200 hover:bg-weak-50`, glyph is
  `text-strong-950`, focus uses the `focus-ring` utility from `globals.css`.
- Badge palette trimmed to three tokens: `red` → `bg-primary-base`,
  `green` → `bg-success-base`, `gold` → `bg-oltin-500`. `orange`, `blue` and
  `violet` are gone (they were Apple system colours).
- `icon` is new — pass any node (e.g. a Phosphor `BookmarkSimple`) to replace
  the bell. It still swings on a count rise; only the default bell has the
  lagging clapper.
- `asChild` no longer needs `@radix-ui/react-slot`: it is one `cloneElement`,
  merging `className`/`style` and appending the badge and the live-region label
  to the child's own children. The root keeps `data-slot="notification-bell"`
  in both modes. `asChild` with a non-element child renders `null`.

---

## `ScrollProgress` — `scroll-progress.tsx`

A 2px reading-progress line pinned to the top of the viewport.

| Prop | Type | Default |
| --- | --- | --- |
| `containerRef` | `RefObject<HTMLElement \| null>` | — (window) |
| `label` | `string` | `"Sahifani o‘qish jarayoni"` |

…plus `ComponentProps<"div">` minus `children` and `role`.

```tsx
<ScrollProgress />
```

**Changed behaviour**

- **Reduced, not restyled.** The registry version was a floating pill with
  section labels, a section list, outside-click and Escape handling, and size
  measuring. All of that is gone, and with it the **`sections` and `offset`
  props and the `ScrollProgressSection` type**. If per-section labels are ever
  needed again, they belong in a separate component.
- What is left: `useScroll` + `useSpring` driving `scaleX` on a
  `bg-primary-base` bar inside a `fixed inset-x-0 top-0 h-0.5 z-50` container.
- `role="progressbar"` with `aria-valuemin/max` and an `aria-valuenow` written
  straight to the DOM node (no re-render) at most once every 100ms.
- `print:hidden`; reduced motion drops the spring and tracks `scrollYProgress`
  directly.

---

## `StepPlayer` — `step-player.tsx`

Story-style step dots with a flubber-morphing play/pause/replay button.

| Prop | Type | Default |
| --- | --- | --- |
| `steps` | `number \| StepPlayerStep[]` | `4` |
| `value` | `number` | — (uncontrolled if omitted) |
| `defaultValue` | `number` | `0` |
| `onValueChange` | `(value: number) => void` | — |
| `playing` | `boolean` | — (uncontrolled if omitted) |
| `defaultPlaying` | `boolean` | `false` |
| `onPlayingChange` | `(playing: boolean) => void` | — |
| `duration` | `number` (ms per step) | `4000` |
| `loop` | `boolean` | `false` |
| `onComplete` | `() => void` | — |
| `size` | `number` (px track height) | `48` |
| `showControl` | `boolean` | `true` |
| `controlPosition` | `"left" \| "right"` | `"right"` |
| `seekable` | `boolean` | `false` |
| `labels` | `Partial<{ play; pause; replay }>` | `{ play: "Ijro etish", pause: "To‘xtatish", replay: "Qayta ko‘rish" }` |

`StepPlayerStep` is `{ duration?: number; label?: string }`. Also exports
`StepPlayerLabels` and `StepPlayerProps`.

```tsx
<StepPlayer steps={5} defaultPlaying loop labels={{ play: "Воспроизвести" }} />
```

**Changed behaviour**

- Track is `bg-sand-base`; pending dots `bg-sand-stroke`, completed dots and
  the active bar's fill `bg-primary-base`; transport button
  `bg-strong-950 text-static-white` with a `primary-base` focus outline.
- `labels` is new and merges over the Uzbek defaults, so passing one key is
  enough. It only covers the transport button; the track's `aria-label`
  (`Step n of m`) and per-step seek labels are unchanged.
- The flubber play↔pause morph and the replay cross-dissolve are untouched.

---

## Known gap: `motion` is not installed

All six animated components import from `motion/react`, and `lib/utils.ts`
imports `clsx` and `tailwind-merge` — none of those three packages are in
`node_modules` (only `flubber` is). `npx eslint components/rare` passes clean,
and `npx tsc --noEmit` reports nothing in this folder except six identical
`TS2307: Cannot find module 'motion/react'` lines, one per file. Installing the
dependencies clears them:

```
npm i motion clsx tailwind-merge
```

`@radix-ui/react-slot` was also missing; that one is fixed here rather than
installed — `NotificationBell` now does its own `asChild`.
