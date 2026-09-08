import { buildAdminData } from "@/lib/admin/data";
import { AuthGate } from "@/components/admin/auth-gate";
import { Dashboard } from "@/components/admin/dashboard";

export const dynamic = "force-static";

/** /admin — read-only dashboard over the seed data, behind a client-side gate. */
export default function AdminPage() {
  const data = buildAdminData();
  return (
    <AuthGate>
      <Dashboard data={data} />
    </AuthGate>
  );
}
