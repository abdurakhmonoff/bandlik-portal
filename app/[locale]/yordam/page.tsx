import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Phone } from "@phosphor-icons/react/dist/ssr";
import type { Locale } from "@/types";
import { isLocale, localePath } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { HowToSteps } from "@/components/home/steps";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { JsonLd, breadcrumbList, absolute } from "@/components/site/json-ld";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "uz";
  const m = getMessages(locale);
  return {
    title: m.help.title,
    description: m.help.metaDescription,
    alternates: { canonical: localePath(locale, "/yordam"), languages: { uz: "/yordam", ru: "/ru/yordam" } },
  };
}

export default async function HelpPage({ params }: { params: Params }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "uz";
  const m = getMessages(locale);
  const h = m.help;
  return (
    <div className="site-container pb-16 pt-8 sm:pt-10">
      <JsonLd data={breadcrumbList([{ name: m.nav.home, url: absolute(locale, "/") }, { name: h.title, url: absolute(locale, "/yordam") }])} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: m.home.faqItems.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />
      <div className="max-w-2xl">
        <h1 className="text-title-h3 sm:text-title-h2">{h.title}</h1>
        <p className="mt-3 text-paragraph-lg text-sub-600">{h.lead}</p>
      </div>

      <section className="mt-12" aria-labelledby="steps">
        <h2 id="steps" className="text-title-h4">
          {h.stepsTitle}
        </h2>
        <div className="mt-6">
          <HowToSteps locale={locale} />
        </div>
      </section>

      <section className="mt-16" aria-labelledby="docs">
        <h2 id="docs" className="text-title-h4">
          {h.docsTitle}
        </h2>
        <p className="mt-2 max-w-2xl text-paragraph-md text-sub-600">{h.docsLead}</p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {h.docs.map((d) => (
            <li key={d.title} className="flex gap-4 rounded-12 border border-soft-200 p-4">
              <FileText size={24} weight="duotone" aria-hidden="true" className="shrink-0 text-primary-base" />
              <div>
                <h3 className="text-label-md font-semibold text-strong-950">{d.title}</h3>
                <p className="mt-1 text-paragraph-sm text-sub-600">{d.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-16 grid gap-10 lg:grid-cols-2">
        <section aria-labelledby="resume">
          <h2 id="resume" className="text-title-h4">
            {h.resumeTitle}
          </h2>
          <ol className="mt-5 space-y-3">
            {h.resume.map((r, i) => (
              <li key={i} className="flex gap-4">
                <span aria-hidden="true" className="font-display tabular inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-sand-base text-label-sm font-bold text-strong-950">
                  {i + 1}
                </span>
                <p className="prose-width pt-1 text-paragraph-md text-strong-950">{r}</p>
              </li>
            ))}
          </ol>
        </section>
        <section aria-labelledby="call">
          <h2 id="call" className="text-title-h4">
            {h.callTitle}
          </h2>
          <ol className="mt-5 space-y-3">
            {h.call.map((r, i) => (
              <li key={i} className="flex gap-4">
                <span aria-hidden="true" className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-sand-base text-strong-950">
                  <Phone size={16} aria-hidden="true" />
                </span>
                <p className="prose-width pt-1 text-paragraph-md text-strong-950">{r}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <section className="mt-16" aria-labelledby="help-faq">
        <h2 id="help-faq" className="text-title-h4">
          {h.faqTitle}
        </h2>
        <Accordion type="single" collapsible className="mt-5 max-w-3xl border-t border-strong-950">
          {m.home.faqItems.map((f, i) => (
            <AccordionItem key={i} value={`q-${i}`}>
              <AccordionTrigger>{f.q}</AccordionTrigger>
              <AccordionContent>
                <p className="prose-width text-paragraph-md text-sub-600">{f.a}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <Link href={localePath(locale, "/aloqa")} className="mt-8 inline-flex h-11 items-center rounded-8 border border-soft-200 px-4 text-label-md font-medium text-strong-950 hover:bg-weak-50 focus-ring">
          {h.contactCta}
        </Link>
      </section>
    </div>
  );
}
