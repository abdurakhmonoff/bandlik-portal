// Adapted from Rare UI (rareui.com) — restyled to Bandlik Portal tokens.
//
// The single place a raw colour value may live inside components/rare.
// Everything that can be a Tailwind token class (backgrounds, text, borders)
// uses one; these literals exist only for the places a colour has to reach
// JavaScript — WebGL uniforms, canvas fills, SVG gradient stops.
//
// Values mirror app/globals.css. Keep them in sync with the @theme block.

/** Qizilqum brick red — --color-primary-base */
export const BRAND_PRIMARY = "#A02D22";
/** Deep slate-blue ink — --color-strong-950 */
export const BRAND_INK = "#1B2430";
/** Warm sand surface — --color-sand-base */
export const BRAND_SAND = "#F2EBE1";
/** Sand hairline — --color-sand-stroke */
export const BRAND_SAND_STROKE = "#E2D6C3";
/** Field green — --color-success-base */
export const BRAND_FIELD = "#0E7C66";
/** Sun gold — --color-oltin-500 */
export const BRAND_GOLD = "#C9922A";
/** --color-white-0 / --color-static-white */
export const BRAND_WHITE = "#FFFFFF";
/** --color-weak-50 */
export const BRAND_WEAK = "#F4F5F7";
/** --color-soft-200 */
export const BRAND_SOFT = "#E3E6EB";

export const BRAND = {
  primary: BRAND_PRIMARY,
  ink: BRAND_INK,
  sand: BRAND_SAND,
  sandStroke: BRAND_SAND_STROKE,
  field: BRAND_FIELD,
  gold: BRAND_GOLD,
  white: BRAND_WHITE,
  weak: BRAND_WEAK,
  soft: BRAND_SOFT,
} as const;

export type BrandColorName = keyof typeof BRAND;

/** 0..255 triple, for canvas fills. */
export type Rgb255 = readonly [number, number, number];
/** 0..1 triple, for GL uniforms. */
export type Rgb01 = readonly [number, number, number];

const HASH = "#";

/** `#RGB` or `#RRGGBB` to 0..255. Falls back to the brand ink on bad input. */
export function hexToRgb255(hex: string): Rgb255 {
  let h = hex.replace(HASH, "").trim();
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const n = Number.parseInt(h, 16);
  if (h.length !== 6 || Number.isNaN(n)) return [27, 36, 48];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Same, normalised to 0..1 for shader uniforms. */
export function hexToRgb01(hex: string): Rgb01 {
  const [r, g, b] = hexToRgb255(hex);
  return [r / 255, g / 255, b / 255];
}

/** `rgb(r g b / a)` from a brand hex — for gradients that need transparency. */
export function withAlpha(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb255(hex);
  return `rgb(${r} ${g} ${b} / ${alpha})`;
}
