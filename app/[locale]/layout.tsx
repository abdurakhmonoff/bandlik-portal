import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { bricolage, onest } from "@/app/fonts";
import "@/app/globals.css";
import { isLocale, locales, localePath } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { LocaleProvider } from "@/lib/i18n/context";
import { GovStrip } from "@/components/site/gov-strip";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { JsonLd, governmentOrganization, SITE_URL } from "@/components/site/json-ld";
import { AssistantWidget } from "@/components/ai-assistant/assistant-widget";
import { TooltipProvider } from "@/components/ui/tooltip";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : "uz";
  const m = getMessages(locale);
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: m.home.title, template: `%s — ${m.site.name}` },
    description: m.site.description,
    applicationName: m.site.name,
    alternates: {
      canonical: localePath(locale, "/"),
      languages: { uz: localePath("uz", "/"), ru: localePath("ru", "/"), "x-default": "/" },
    },
    openGraph: {
      type: "website",
      siteName: m.site.name,
      locale: locale === "ru" ? "ru_RU" : "uz_UZ",
      title: m.home.title,
      description: m.site.description,
      images: [{ url: `/brand/og.png`, width: 1200, height: 630, alt: m.site.tagline }],
    },
    twitter: { card: "summary_large_image" },
    robots: { index: true, follow: true },
    icons: { icon: "/icon.svg", apple: "/apple-icon.png" },
  };
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const m = getMessages(locale);
  return (
    <html lang={locale} className={`${bricolage.variable} ${onest.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#asosiy"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-8 focus:bg-strong-950 focus:px-4 focus:py-2.5 focus:text-label-sm focus:text-white-0 focus:outline-none focus:shadow-regular-md"
        >
          {m.site.skipToContent}
        </a>
        <LocaleProvider locale={locale}>
          <TooltipProvider>
            <GovStrip locale={locale} />
            <Header locale={locale} />
            <main id="asosiy" className="flex-1">
              {children}
            </main>
            <Footer locale={locale} />
            <AssistantWidget locale={locale} />
          </TooltipProvider>
        </LocaleProvider>
        <JsonLd data={governmentOrganization(locale)} />
      </body>
    </html>
  );
}
