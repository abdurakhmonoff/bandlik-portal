import { ArrowSquareOut, MapPin } from "@phosphor-icons/react/dist/ssr";
import type { Locale } from "@/types";
import { getMessages } from "@/lib/i18n/messages";

/** Qiziltepa town centre — used when a vacancy has no coordinates of its own. */
export const DISTRICT_CENTER = { lat: 40.0353, lng: 64.8483 };

/**
 * OpenStreetMap embed with a marker. The iframe is lazy-loaded so it never
 * competes with the vacancy content on a slow connection.
 */
export function MapSnippet({
  locale,
  mahalla,
  address,
  coords,
  zoom = 13,
}: {
  locale: Locale;
  mahalla: string | null;
  address: string | null;
  coords?: { lat: number; lng: number } | null;
  zoom?: number;
}) {
  const m = getMessages(locale);
  const c = coords ?? DISTRICT_CENTER;
  const span = 0.06 / (zoom / 13);
  const bbox = [c.lng - span, c.lat - span * 0.55, c.lng + span, c.lat + span * 0.55].map((n) => n.toFixed(5)).join("%2C");
  const embed = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${c.lat}%2C${c.lng}`;
  const full = `https://www.openstreetmap.org/?mlat=${c.lat}&mlon=${c.lng}#map=${zoom}/${c.lat}/${c.lng}`;
  const title = `${m.common.map}: ${mahalla ?? (locale === "ru" ? "Кызылтепа" : "Qiziltepa")}`;
  return (
    <section className="overflow-hidden rounded-16 border border-soft-200" aria-label={m.common.map}>
      <div className="relative aspect-[16/10] w-full bg-sand-light">
        <iframe
          src={embed}
          title={title}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 size-full border-0"
        />
      </div>
      <div className="flex items-start gap-3 px-4 py-3">
        <MapPin size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-primary-base" />
        <div className="min-w-0 flex-1">
          <p className="text-label-sm font-semibold text-strong-950">{mahalla ?? (locale === "ru" ? "Кызылтепинский район" : "Qiziltepa tumani")}</p>
          <p className="text-label-xs text-sub-600">{address ?? m.detail.mapCaption}</p>
        </div>
        <a
          href={full}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1 text-label-xs text-sub-600 hover:text-strong-950 focus-ring rounded-4"
        >
          {m.common.map}
          <ArrowSquareOut size={12} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
