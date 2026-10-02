import type { ReactNode } from "react";
import { AuthLayout } from "@/features/auth/auth-layout";

export default function PublicAuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AuthLayout>{children}</AuthLayout>;
}
