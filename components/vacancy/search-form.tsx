import { MagnifyingGlass, MapPin } from "@phosphor-icons/react/dist/ssr";
import type { Locale } from "@/types";
import { getMessages } from "@/lib/i18n/messages";
import { localePath } from "@/lib/i18n/config";
import { getMahallas, countByMahalla } from "@/lib/vacancies";
import { cn } from "@/lib/utils";

/**
 * The hero search. A plain GET form to /vakansiyalar, so it works with no
 * JavaScript and every search is a shareable URL.
 */
export function SearchForm({
  locale,
  compact = false,
  defaultQuery = "",
  defaultMahalla = "",
  className,
  id = "qidiruv",
  onDark = false,
}: {
  locale: Locale;
  compact?: boolean;
  defaultQuery?: string;
  defaultMahalla?: string;
  className?: string;
  id?: string;
  /** on the photo hero: no grey ring, a deeper shadow */
  onDark?: boolean;
}) {
  const m = getMessages(locale);
  const counts = countByMahalla();
  const mahallas = getMahallas().filter((x) => counts[x.id]);
  const h = compact ? "h-12" : "h-14";
  return (
    <form
      action={localePath(locale, "/vakansiyalar")}
      method="get"
      role="search"
      aria-label={m.common.search}
      className={cn(
        "flex flex-col gap-2 rounded-16 bg-white-0 p-2 sm:flex-row sm:items-stretch sm:gap-0 sm:rounded-full sm:p-1.5",
        onDark ? "shadow-[0_24px_48px_-16px_rgb(0_0_0/0.45)]" : "shadow-regular-md ring-1 ring-soft-200",
        className,
      )}
    >
      <div className="relative flex-1">
        <label htmlFor={`${id}-q`} className="sr-only">
          {m.home.searchLabel}
        </label>
        <MagnifyingGlass
          size={20}
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sub-600"
        />
        <input
          id={`${id}-q`}
          name="q"
          type="search"
          defaultValue={defaultQuery}
          placeholder={m.home.searchPlaceholder}
          autoComplete="off"
          enterKeyHint="search"
          className={cn(
            "w-full rounded-12 bg-transparent pl-11 pr-4 text-paragraph-md text-strong-950 placeholder:text-soft-400 focus-ring-inset sm:rounded-full",
            h,
          )}
        />
      </div>
      <div className="relative sm:w-56 sm:border-l sm:border-soft-200">
        <label htmlFor={`${id}-mahalla`} className="sr-only">
          {m.home.mahallaLabel}
        </label>
        <MapPin
          size={20}
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sub-600"
        />
        <select
          id={`${id}-mahalla`}
          name="mahalla"
          defaultValue={defaultMahalla}
          className={cn(
            "w-full appearance-none rounded-12 bg-transparent pl-11 pr-9 text-paragraph-md text-strong-950 focus-ring-inset sm:rounded-full",
            h,
          )}
        >
          <option value="">{m.home.mahallaAll}</option>
          {mahallas.map((x) => (
            <option key={x.id} value={x.id}>
              {x.name[locale]} ({counts[x.id]})
            </option>
          ))}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-sub-600"
        >
          <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <button
        type="submit"
        className={cn(
          "inline-flex items-center justify-center rounded-12 bg-primary-base px-6 text-label-md font-semibold text-white-0 transition-colors duration-150 hover:bg-primary-dark focus-ring sm:ml-1.5 sm:rounded-full",
          h,
        )}
      >
        {m.nav.findJob}
      </button>
    </form>
  );
}
