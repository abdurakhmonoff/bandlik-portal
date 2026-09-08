/**
 * Search normalisation for Uzbek Latin.
 * Users type oʻ / o' / o` / o and gʻ / g' / g interchangeably, and mix
 * Cyrillic in. Everything collapses to plain ASCII so "haydovchi",
 * "Haydovchi" and "ҳайдовчи" all hit the same tokens.
 */

const CYR_TO_LAT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "j", з: "z", и: "i", й: "y", к: "k",
  л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "x", ц: "ts",
  ч: "ch", ш: "sh", щ: "sh", ъ: "", ь: "", ы: "i", э: "e", ю: "yu", я: "ya", ў: "o", қ: "q", ғ: "g", ҳ: "h",
};

export function normalize(input: string): string {
  let s = input.toLowerCase();
  // apostrophe-like marks after o/g are dropped: oʻ → o, gʻ → g
  s = s.replace(/[ʻʼ'’‘`´ʹ]/g, "");
  // Cyrillic → Latin
  s = s.replace(/[Ѐ-ӿ]/g, (ch) => CYR_TO_LAT[ch] ?? ch);
  // strip diacritics (ş, ç etc.)
  s = s.normalize("NFKD").replace(/[̀-ͯ]/g, "");
  // common spelling equivalents
  s = s.replace(/x/g, "h").replace(/w/g, "v").replace(/ts/g, "s");
  s = s.replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();
  return s;
}

export function tokens(input: string): string[] {
  return normalize(input).split(/[\s-]+/).filter((t) => t.length > 1);
}

/** Score 0..n: how many query tokens appear (as prefixes) in the haystack. */
export function matchScore(query: string, haystack: string): number {
  const q = tokens(query);
  if (q.length === 0) return 0;
  const h = normalize(haystack);
  const words = h.split(" ");
  let score = 0;
  for (const t of q) {
    if (h.includes(t)) score += 2;
    else if (words.some((w) => w.startsWith(t.slice(0, Math.max(3, t.length - 2))))) score += 1;
  }
  return score;
}
