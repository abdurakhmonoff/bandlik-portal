import type { Metadata } from "next";
import type { Locale } from "@/types";
import { isLocale, localePath } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { SavedList } from "@/components/vacancy/saved-list";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "uz";
  const m = getMessages(locale);
  return {
    title: m.saved.title,
    description: m.saved.metaDescription,
    robots: { index: false, follow: true },
    alternates: { canonical: localePath(locale, "/saqlangan") },
  };
}

export default async function SavedPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "uz";
  const m = getMessages(locale);
  return (
    <div className="site-container pb-16 pt-8 sm:pt-10">
      <div className="max-w-2xl">
        <h1 className="text-title-h3 sm:text-title-h2">{m.saved.title}</h1>
        <p className="mt-3 text-paragraph-lg text-sub-600">{m.saved.lead}</p>
      </div>
      <noscript>
        <p className="mt-6 rounded-12 bg-warning-lighter px-4 py-3 text-paragraph-sm text-warning-dark">{m.saved.noScript}</p>
      </noscript>
      <div className="mt-8">
        <SavedList locale={locale} />
      </div>
    </div>
  );
}
