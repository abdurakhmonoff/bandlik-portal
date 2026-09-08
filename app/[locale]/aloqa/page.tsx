import type { Metadata } from "next";
import { MapPin, Phone, Clock, EnvelopeSimple, PaperPlaneTilt, Globe, ArrowSquareOut, Info } from "@phosphor-icons/react/dist/ssr";
import type { Locale } from "@/types";
import { isLocale, localePath } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { hokimlik, bandlikMarkazi, nationalHelpline, type Institution } from "@/data/organization";
import { telHref } from "@/lib/format";
import { JsonLd, breadcrumbList, absolute } from "@/components/site/json-ld";
import { MapSnippet } from "@/components/site/map-snippet";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "uz";
  const m = getMessages(locale);
  return {
    title: m.contact.title,
    description: m.contact.metaDescription,
    alternates: { canonical: localePath(locale, "/aloqa"), languages: { uz: "/aloqa", ru: "/ru/aloqa" } },
  };
}

function InstitutionCard({ inst, locale, heading }: { inst: Institution; locale: Locale; heading: string }) {
  const m = getMessages(locale);
  const sample = inst.addressSample || inst.phones.some((p) => p.sample);
  return (
    <section className="rounded-16 border border-soft-200 p-5 sm:p-6" aria-labelledby={`inst-${heading}`}>
      <p className="text-label-xs text-sub-600">{heading}</p>
      <h2 id={`inst-${heading}`} className="mt-1 text-title-h5">
        {inst.name[locale]}
      </h2>
      {sample && (
        <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-warning-lighter px-2.5 py-1 text-label-xs text-warning-dark">
          <Info size={14} aria-hidden="true" />
          {m.common.sampleData}
        </p>
      )}
      <dl className="mt-5 space-y-4">
        <div className="flex gap-3">
          <MapPin size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-soft-400" />
          <div>
            <dt className="text-label-xs text-sub-600">{m.common.address}</dt>
            <dd className="text-paragraph-md text-strong-950">{inst.address[locale]}</dd>
          </div>
        </div>
        {inst.phones.map((p) => (
          <div key={p.phone} className="flex gap-3">
            <Phone size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-soft-400" />
            <div>
              <dt className="text-label-xs text-sub-600">{p.label[locale]}</dt>
              <dd>
                <a href={telHref(p.phone)} className="font-display tabular text-label-lg font-bold text-strong-950 hover:text-primary-base focus-ring rounded-4">
                  {p.phone}
                </a>
              </dd>
            </div>
          </div>
        ))}
        <div className="flex gap-3">
          <Clock size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-soft-400" />
          <div>
            <dt className="text-label-xs text-sub-600">{m.common.hours}</dt>
            {inst.hours.map((h) => (
              <dd key={h.days.uz} className="text-paragraph-md text-strong-950">
                {h.days[locale]}: <span className="tabular">{h.time}</span>
              </dd>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <EnvelopeSimple size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-soft-400" />
          <div>
            <dt className="text-label-xs text-sub-600">{m.common.email}</dt>
            <dd>
              <a href={`mailto:${inst.email}`} className="text-paragraph-md text-strong-950 hover:text-primary-base focus-ring rounded-4">
                {inst.email}
              </a>
            </dd>
          </div>
        </div>
        <div className="flex gap-3">
          <PaperPlaneTilt size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-soft-400" />
          <div>
            <dt className="text-label-xs text-sub-600">{m.common.telegram}</dt>
            <dd>
              <a href={inst.telegram.url} target="_blank" rel="noopener noreferrer" className="text-paragraph-md text-strong-950 hover:text-primary-base focus-ring rounded-4">
                {inst.telegram.handle}
              </a>
            </dd>
          </div>
        </div>
        <div className="flex gap-3">
          <Globe size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-soft-400" />
          <div>
            <dt className="sr-only">Web</dt>
            <dd>
              <a href={inst.website.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-paragraph-md text-strong-950 hover:text-primary-base focus-ring rounded-4">
                {inst.website.label}
                <ArrowSquareOut size={14} aria-hidden="true" />
              </a>
            </dd>
          </div>
        </div>
      </dl>
    </section>
  );
}

export default async function ContactPage({ params }: { params: Params }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "uz";
  const m = getMessages(locale);
  return (
    <div className="site-container pb-16 pt-8 sm:pt-10">
      <JsonLd data={breadcrumbList([{ name: m.nav.home, url: absolute(locale, "/") }, { name: m.contact.title, url: absolute(locale, "/aloqa") }])} />
      <div className="max-w-2xl">
        <h1 className="text-title-h3 sm:text-title-h2">{m.contact.title}</h1>
        <p className="mt-3 text-paragraph-lg text-sub-600">{m.contact.lead}</p>
        <p className="mt-4 rounded-12 bg-warning-lighter px-4 py-3 text-paragraph-sm text-warning-dark">{m.contact.sampleNotice}</p>
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <InstitutionCard inst={bandlikMarkazi} locale={locale} heading={m.contact.center} />
        <InstitutionCard inst={hokimlik} locale={locale} heading={m.contact.hokimlik} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-16 bg-sand-base p-5 sm:p-6" aria-labelledby="helpline">
          <h2 id="helpline" className="text-title-h6">
            {m.contact.helpline}
          </h2>
          <p className="mt-1 text-paragraph-sm text-sub-600">{nationalHelpline.label[locale]}</p>
          <a href={telHref(nationalHelpline.phone)} className="font-display tabular mt-3 inline-block text-title-h5 font-bold text-strong-950 hover:text-primary-base focus-ring rounded-4">
            {nationalHelpline.phone}
          </a>
          <p className="mt-2">
            <a href={nationalHelpline.telegram.url} target="_blank" rel="noopener noreferrer" className="text-label-sm text-strong-950 underline-offset-4 hover:underline focus-ring rounded-4">
              {nationalHelpline.telegram.handle}
            </a>
          </p>
        </section>
        <MapSnippet locale={locale} mahalla={bandlikMarkazi.shortName[locale]} address={bandlikMarkazi.address[locale]} coords={{ lat: bandlikMarkazi.map.lat, lng: bandlikMarkazi.map.lng }} zoom={15} />
      </div>
    </div>
  );
}
