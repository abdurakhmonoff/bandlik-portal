import { NextResponse } from "next/server";
import { answer } from "@/lib/assistant/engine";
import type { AssistantRequest } from "@/lib/assistant/types";

/**
 * AI yordamchi endpoint. Stateless: nothing is stored, nothing is sent
 * anywhere. Today it runs the scripted engine over the seed data; a
 * model-backed engine can be dropped in here later.
 */
export async function POST(request: Request) {
  let body: Partial<AssistantRequest>;
  try {
    body = (await request.json()) as Partial<AssistantRequest>;
  } catch {
    return NextResponse.json({ error: "bad-request" }, { status: 400 });
  }
  const message = typeof body.message === "string" ? body.message : "";
  const locale = body.locale === "ru" ? "ru" : "uz";
  const currentVacancy = typeof body.currentVacancy === "string" ? body.currentVacancy : null;
  const reply = answer({ message, locale, currentVacancy });
  return NextResponse.json(reply, { headers: { "Cache-Control": "no-store" } });
}
