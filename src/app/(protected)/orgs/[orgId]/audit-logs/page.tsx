import { AuditLogScreen } from "@/features/audit/audit-log-screen";
import { Suspense } from "react";

export default function AuditLogPage() {
  return (
    <Suspense
      fallback={
        <main aria-busy="true" className="p-8" role="status">
          Loading audit log…
        </main>
      }
    >
      <AuditLogScreen />
    </Suspense>
  );
}
