"use client";

import { InvitationAcceptScreen } from "@/features/invitations/invitation-accept-screen";
import { useParams } from "next/navigation";

export default function AcceptInvitationPage() {
  const { token } = useParams<{ token: string }>();
  return <InvitationAcceptScreen key={token} token={token} />;
}
