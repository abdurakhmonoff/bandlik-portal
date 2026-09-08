import { NextResponse } from "next/server";
import { getById, getMahalla, getOrganizationById } from "@/lib/vacancies";
import type { AssistantVacancyCard } from "@/lib/assistant/types";

/**
 * Resolves saved vacancy ids (kept in the visitor's localStorage) to
 * card data, so the saved page does not ship the whole dataset to the
 * client. Read-only; nothing is stored.
 */
export function GET(request: Request) {
  const url = new URL(request.url);
  const locale = url.searchParams.get("locale") === "ru" ? "ru" : "uz";
  const ids = (url.searchParams.get("ids") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 200);
  const cards: AssistantVacancyCard[] = [];
  for (const id of ids) {
    const v = getById(id);
    if (!v) continue;
    const org = getOrganizationById(v.organizationId);
    const mahalla = v.mahallaId ? getMahalla(v.mahallaId) : undefined;
    cards.push({
      id: v.id,
      slug: v.slug,
      title: v.title[locale],
      organization: org?.name[locale] ?? null,
      mahalla: mahalla?.name[locale] ?? null,
      salaryMin: v.salaryMin,
      salaryMax: v.salaryMax,
      salaryNegotiable: v.salaryNegotiable,
      paymentType: v.paymentType,
    });
  }
  return NextResponse.json({ cards, missing: ids.length - cards.length }, { headers: { "Cache-Control": "no-store" } });
}
