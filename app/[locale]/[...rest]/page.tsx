import { notFound } from "next/navigation";

/** Any path that no route claims ends here, so the locale layout can render not-found. */
export default function CatchAll() {
  notFound();
}

export function generateStaticParams() {
  return [];
}
