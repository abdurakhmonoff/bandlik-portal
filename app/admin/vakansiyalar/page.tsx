import type { Metadata } from "next";
import { buildAdminJobs } from "@/lib/admin/data";
import { AuthGate } from "@/components/admin/auth-gate";
import { AdminShell } from "@/components/admin/shell";
import { JobsGrid } from "@/components/admin/jobs-grid";

export const dynamic = "force-static";
export const metadata: Metadata = { title: "Vakansiyalar — Boshqaruv paneli", robots: { index: false, follow: false } };

/** /admin/vakansiyalar — every listing in a compact grid, with an edit sheet (not wired to storage yet). */
export default function AdminJobsPage() {
  const data = buildAdminJobs();
  return (
    <AuthGate>
      <AdminShell>
        <JobsGrid data={data} />
      </AdminShell>
    </AuthGate>
  );
}
