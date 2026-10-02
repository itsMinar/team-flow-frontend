import { Suspense } from "react";
import { AuthLoading } from "@/features/auth/auth-layout";
import { LoginForm } from "@/features/auth/login-form";

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthLoading />}>
      <LoginForm />
    </Suspense>
  );
}
