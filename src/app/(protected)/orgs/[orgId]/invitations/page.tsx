import { InvitationListScreen } from "@/features/invitations/invitation-list-screen";
import { Suspense } from "react";

export default function InvitationsPage() {
  return (
    <Suspense
      fallback={
        <main aria-busy="true" className="p-8" role="status">
          Loading invitations…
        </main>
      }
    >
      <InvitationListScreen />
    </Suspense>
  );
}
