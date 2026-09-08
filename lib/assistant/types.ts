import type { Locale } from "@/types";

/** Trimmed vacancy shape sent to the chat client for mini cards. */
export interface AssistantVacancyCard {
  id: string;
  slug: string;
  title: string;
  organization: string | null;
  mahalla: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryNegotiable: boolean;
  paymentType: "monthly" | "piecework" | "hourly" | "contract";
}

export interface AssistantLink {
  href: string;
  label: string;
}

export interface AssistantReply {
  /** Plain text; may contain line breaks. */
  text: string;
  vacancies?: AssistantVacancyCard[];
  /** Follow-up chips the user can tap. */
  suggestions?: string[];
  link?: AssistantLink;
  /** Which intent answered — handy for a later model hand-off. */
  intent: string;
}

export interface AssistantRequest {
  message: string;
  locale: Locale;
  /** Slug of the vacancy the user is looking at, if any. */
  currentVacancy?: string | null;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  at: number;
  vacancies?: AssistantVacancyCard[];
  suggestions?: string[];
  link?: AssistantLink;
  /** true while the assistant text is still being revealed */
  streaming?: boolean;
}
